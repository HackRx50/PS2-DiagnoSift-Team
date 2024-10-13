import cv2
import numpy as np
from scipy.ndimage import rotate
import pytesseract
from fuzzywuzzy import fuzz
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from msrest.authentication import CognitiveServicesCredentials
import google.generativeai as genai
from django.conf import settings
import io
import time
import os
import uuid
from collections import deque
from datetime import datetime, timedelta

# Ensure you have Tesseract installed and specify the path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Initialize Azure Computer Vision Client
vision_client = ComputerVisionClient(
    endpoint=settings.VISION_ENDPOINT,
    credentials=CognitiveServicesCredentials(settings.VISION_KEY)
)

# Initialize Google Generative AI
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# Add these constants for rate limiting
MAX_REQUESTS_PER_MINUTE = 15
CYCLE_DURATION = 60  # seconds
RETRY_DELAY = 5  # seconds
MAX_RETRIES = 3

# Create rate limiting classes for Vision and Gemini
class RateLimiter:
    def __init__(self, max_requests, time_frame):
        self.max_requests = max_requests
        self.time_frame = time_frame
        self.request_times = deque()

    def wait_if_needed(self):
        now = datetime.now()
        while len(self.request_times) >= self.max_requests:
            if now - self.request_times[0] > timedelta(seconds=self.time_frame):
                self.request_times.popleft()
            else:
                time_to_wait = (self.request_times[0] + timedelta(seconds=self.time_frame) - now).total_seconds()
                time.sleep(max(0, time_to_wait))
                now = datetime.now()
        self.request_times.append(now)

vision_limiter = RateLimiter(MAX_REQUESTS_PER_MINUTE, CYCLE_DURATION)
gemini_limiter = RateLimiter(MAX_REQUESTS_PER_MINUTE, CYCLE_DURATION)

def correct_skew(image, delta=1, limit=5):
    def determine_score(arr, angle):
        data = rotate(arr, angle, reshape=False, order=0)
        histogram = np.sum(data, axis=1, dtype=float)
        score = np.sum((histogram[1:] - histogram[:-1]) ** 2, dtype=float)
        return histogram, score

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    scores = []
    angles = np.arange(-limit, limit + delta, delta)
    for angle in angles:
        _, score = determine_score(thresh, angle)
        scores.append(score)

    best_angle = angles[scores.index(max(scores))]

    (h, w) = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, best_angle, 1.0)
    corrected = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    return corrected

def correct_image_orientation(image):
    (h, w) = image.shape[:2]

    if h < 700 or w < 700:
        return image

    config = "--psm 0"
    osd = pytesseract.image_to_osd(image, config=config)
    angle = int(osd.split("Rotate: ")[1].split("\n")[0])

    if angle != 0:
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, -angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return rotated
    return image

def preprocess_image(img):
    corrected_img = correct_image_orientation(img)
    gray = cv2.cvtColor(np.array(corrected_img), cv2.COLOR_BGR2GRAY)
    orig_height, orig_width = gray.shape
    height, width = orig_height, orig_width
    scale_factor = 1

    if height < 700 or width < 700:
        scale_factor = 2
        gray = cv2.resize(gray, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_LANCZOS4)

    processed_image = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        65,
        13
    )

    return processed_image, scale_factor, orig_width, orig_height

def extract_text_with_boxes(image):
    processed_image, scale_factor, orig_width, orig_height = preprocess_image(image)
    config = "--psm 6 --oem 3"

    data = pytesseract.image_to_data(processed_image, output_type=pytesseract.Output.DICT, config=config)

    extracted_data = []
    for i in range(len(data['text'])):
        text = data['text'][i].strip()
        if text:
            extracted_data.append({
                'text': text,
                'box': {
                    'x': int(data['left'][i] / scale_factor),
                    'y': int(data['top'][i] / scale_factor),
                    'width': int(data['width'][i] / scale_factor),
                    'height': int(data['height'][i] / scale_factor)
                }
            })

    resized_image = cv2.resize(image, (orig_width, orig_height), interpolation=cv2.INTER_LANCZOS4)
    return resized_image, extracted_data

def is_similar_to_diagnosis(text, threshold=50):
    keywords = ["diagnosis"]
    for keyword in keywords:
        if fuzz.ratio(text.lower(), keyword) >= threshold:
            return True
    return False

def draw_provisional_diagnosis_box_and_extract_rois(image, extracted_data):
    rois = []
    height, width, _ = image.shape
    best_match = None
    highest_ratio = 0

    for item in extracted_data:
        text = item['text']
        box = item['box']

        if is_similar_to_diagnosis(text):
            ratio = fuzz.ratio(text.lower(), "diagnosis")
            if ratio > highest_ratio:
                highest_ratio = ratio
                best_match = item

    if best_match and (height >= 700 and width >= 700):
        box = best_match['box']
        cv2.rectangle(image,
                      (box['x'] + 100, box['y'] - 40),
                      (width, box['y'] + box['height'] + 30),
                      (0, 255, 0), 2)
        roi = image[box['y'] - 40:box['y'] + box['height'] + 30, box['x'] + 200:width]
        rois.append(roi)

    return rois

def draw_bounding_box(image):
    height, width, _ = image.shape
    x = int(0.35 * width)
    y = int(0.25 * height)
    box_width = int(width)
    box_height = int(0.1 * height)

    cv2.rectangle(image, (x, y), (x + box_width, y + box_height), (0, 255, 0), 2)

    return (x, y, box_width, box_height)

def extract_handwritten_text(image_path, retries=MAX_RETRIES):
    for attempt in range(retries):
        try:
            vision_limiter.wait_if_needed()
            with open(image_path, 'rb') as image_file:
                read_response = vision_client.read_in_stream(image_file, raw=True)
            
            read_operation_location = read_response.headers["Operation-Location"]
            operation_id = read_operation_location.split("/")[-1]

            while True:
                vision_limiter.wait_if_needed()
                read_result = vision_client.get_read_result(operation_id)
                if read_result.status not in [OperationStatusCodes.running, OperationStatusCodes.not_started]:
                    break
                time.sleep(1)

            if read_result.status == OperationStatusCodes.succeeded:
                text = ""
                for text_result in read_result.analyze_result.read_results:
                    for line in text_result.lines:
                        text += line.text + "\n"
                return text.strip()
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt < retries - 1:
                time.sleep(RETRY_DELAY)
            else:
                print("Max retries reached. Returning empty string.")
                return ""
    return ""

def get_formatted_data_from_gemini(text, retries=MAX_RETRIES):
    prompt = f"""Analyze the following medical text and extract the provisional diagnosis. Create a JSON object with the following keys:
    1. "provisional_diagnosis": The extracted provisional diagnosis.
    2. "ICD10_code": The corresponding ICD-10-CM code for the diagnosis.

    Rules:
    - If the provisional diagnosis is clear and correct, use it as is.
    - Only make very minor corrections for obvious typos or standardization, Keep the abbreviations same"
    - If the diagnosis is unclear or seems incomplete, use the most appropriate term based on the available information.
    - If no clear diagnosis is found, use "Unspecified diagnosis" and code as "R69".
    - Always provide the most specific ICD-10-CM code possible based on the information given.

    Text to analyze:

    {text}

    Please return only the JSON object, without any additional formatting or explanation."""

    for attempt in range(retries):
        try:
            gemini_limiter.wait_if_needed()
            response = model.generate_content(prompt)
            response_text = response.text

            cleaned_response = response_text.replace('```json\n', '').replace('\n```', '').strip()

            return eval(cleaned_response)
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt < retries - 1:
                time.sleep(RETRY_DELAY)
            else:
                print("Max retries reached. Returning empty dict.")
                return {}

def save_image(image, filename, folder='processed_images'):
    if not os.path.exists(folder):
        os.makedirs(folder)
    filepath = os.path.join(folder, filename)
    cv2.imwrite(filepath, image)
    return filepath

def process_image(image_file):
    # Read the image file into a numpy array
    image_bytes = image_file.read()
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError(f"Error: Unable to read image {image_file.name}")

    # Generate a unique filename
    unique_filename = f"{uuid.uuid4()}.png"

    # Save the original image for preview
    original_image_path = save_image(image, f"original_{unique_filename}")

    # Step 1: Correct skew
    skew_corrected_image = correct_skew(image)

    # Step 2: Extract text and draw diagnosis box
    extracted_image, extracted_data = extract_text_with_boxes(skew_corrected_image)

    # Step 3: Draw bounding box or extract ROIs
    rois = []
    height, width = skew_corrected_image.shape[:2]
    if height < 700 or width < 700:
        bounding_box_coords = draw_bounding_box(skew_corrected_image)
        x, y, box_width, box_height = bounding_box_coords
        roi = skew_corrected_image[y:y + box_height, x:x + box_width]
        if roi.size > 0:
            rois.append(roi)
    else:
        rois = draw_provisional_diagnosis_box_and_extract_rois(extracted_image, extracted_data)
        
    extracted_text = ""
    for i, roi in enumerate(rois):
        if roi.size > 0:
            # Ensure ROI is at least 60x60 pixels
            roi_height, roi_width = roi.shape[:2]
            if roi_height < 60 or roi_width < 60:
                roi = cv2.resize(roi, (max(60, roi_width), max(60, roi_height)), interpolation=cv2.INTER_LANCZOS4)

            roi_output_path = os.path.join("processed_images", f"roi_{i}.png")
            cv2.imwrite(roi_output_path, roi)
            extracted_text = extract_handwritten_text(roi_output_path)
        else:
            print(f"Warning: Skipped saving empty ROI for {image_file.name}, index {i}.")

    # Get formatted data from Gemini
    formatted_data = get_formatted_data_from_gemini(extracted_text)

    # Save the processed image
    processed_image_path = save_image(extracted_image, f"processed_{unique_filename}")

    # Save ROIs
    roi_paths = []
    for i, roi in enumerate(rois):
        roi_path = save_image(roi, f"roi_{i}_{unique_filename}")
        roi_paths.append(roi_path)

    # Prepare and return the result
    result = {
        'file_name': image_file.name,
        'extracted_diagnosis': extracted_text,
        'corrected_diagnosis': formatted_data.get('provisional_diagnosis', 'Not found'),
        'icd10_code': formatted_data.get('ICD10_code', 'Not found'),
    }

    return result