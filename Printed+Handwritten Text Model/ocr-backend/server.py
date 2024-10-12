import cv2
import numpy as np
import pytesseract
from fuzzywuzzy import fuzz
from scipy.ndimage import rotate
import os

# Ensure you have Tesseract installed and specify the path to Tesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Step 1: Skew correction
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

# Step 2: Orientation correction
def correct_image_orientation(image):
    (h, w) = image.shape[:2]

    # Skip orientation correction for images smaller than 700x700
    if h < 700 or w < 700:
        return image

    config = "--psm 0"  # Page segmentation mode for orientation detection
    osd = pytesseract.image_to_osd(image, config=config)
    angle = int(osd.split("Rotate: ")[1].split("\n")[0])

    if angle != 0:
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, -angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return rotated
    return image

# Step 3: Preprocess image
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

# Step 4: Extract text with bounding boxes
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

# Step 5: Draw provisional diagnosis box and extract ROIs
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

# Helper function to check similarity to "diagnosis"
def is_similar_to_diagnosis(text, threshold=50):
    keywords = ["diagnosis"]
    for keyword in keywords:
        if fuzz.ratio(text.lower(), keyword) >= threshold:
            return True
    return False

# Function to draw bounding box if image size is less than 700
def draw_bounding_box(image):
    height, width, _ = image.shape
    x = int(0.35 * width)
    y = int(0.25 * height)
    box_width = int(width)
    box_height = int(0.1 * height)

    cv2.rectangle(image, (x, y), (x + box_width, y + box_height), (0, 255, 0), 2)

    return (x, y, box_width, box_height)

# Main flow
def process_images(input_folder, output_folder):
    for filename in os.listdir(input_folder):
        if filename.endswith(".png") or filename.endswith(".jpg"):
            image_path = os.path.join(input_folder, filename)

            # Ensure the image is read successfully
            image = cv2.imread(image_path)
            if image is None:
                print(f"Error: Unable to read image {filename}")
                continue

            # Step 1: Skew correction
            skew_corrected_image = correct_skew(image)

            # Step 2: Extract text and draw diagnosis box for larger images
            extracted_image, extracted_data = extract_text_with_boxes(skew_corrected_image)
            
            # Step 3: Initialize ROIs list and check image size for bounding box
            rois = []
            height, width = skew_corrected_image.shape[:2]
            if height < 700 or width < 700:
                bounding_box_coords = draw_bounding_box(skew_corrected_image)
                x, y, box_width, box_height = bounding_box_coords
                roi = skew_corrected_image[y:y + box_height, x:x + box_width]
                if roi.size > 0:
                    rois.append(roi)

            # Step 4: Draw provisional diagnosis box and extract ROIs for large images
            diagnosis_rois = draw_provisional_diagnosis_box_and_extract_rois(extracted_image, extracted_data)
            rois.extend(diagnosis_rois)

            # Save the ROIs to the output folder with a modified name
            for i, roi in enumerate(rois):
                if roi.size > 0:
                    # Ensure ROI is at least 60x60 pixels
                    roi_height, roi_width = roi.shape[:2]
                    if roi_height < 60 or roi_width < 60:
                        roi = cv2.resize(roi, (max(60, roi_width), max(60, roi_height)), interpolation=cv2.INTER_LANCZOS4)

                    roi_output_path = os.path.join(output_folder, f"{filename.split('.')[0]}_roi_{i}.png")
                    cv2.imwrite(roi_output_path, roi)
                else:
                    print(f"Warning: Skipped saving empty ROI for {filename}, index {i}.")

            print(f"Processed: {filename}")

# Example usage
input_folder = "./input2/"  # Folder containing the input images
output_folder = "./output"  # Folder where the ROIs will be saved

# Ensure the output folder exists
os.makedirs(output_folder, exist_ok=True)

process_images(input_folder, output_folder)
