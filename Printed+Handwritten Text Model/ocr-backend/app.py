from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import pytesseract
from fuzzywuzzy import fuzz
import os

app = Flask(__name__)

# Allow CORS for the specific frontend origin (localhost:5173 in this case)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Set the upload folder
UPLOAD_FOLDER = 'uploads'  # Ensure this directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def home():
    return "Welcome to the home page!" 

def preprocess_image(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, None, fx=1, fy=1, interpolation=cv2.INTER_LANCZOS4)
    processed_image = cv2.adaptiveThreshold(
        resized,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        65,
        13
    )
    return processed_image

def extract_text_with_boxes(image):
    processed_image = preprocess_image(image)
    data = pytesseract.image_to_data(processed_image, output_type=pytesseract.Output.DICT)
    
    extracted_data = []
    for i in range(len(data['text'])):
        text = data['text'][i].strip()
        if text:
            extracted_data.append({
                'text': text,
                'box': {
                    'x': data['left'][i],
                    'y': data['top'][i],
                    'width': data['width'][i],
                    'height': data['height'][i]
                }
            })

    return extracted_data

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

    if best_match:
        box = best_match['box']
        cv2.rectangle(image, 
                      (box['x'] + 200, box['y'] - 40), 
                      (width, box['y'] + box['height'] + 30), 
                      (0, 255, 0), 2)
        roi = image[box['y']-40:box['y'] + box['height']+30, box['x'] + 200:width]
        rois.append(roi)

    return rois

def is_similar_to_diagnosis(text, threshold=80):
    keywords = ["diagnosis", "provisional diagnosis"]
    for keyword in keywords:
        if fuzz.ratio(text.lower(), keyword) >= threshold:
            return True
    return False

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'files' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    files = request.files.getlist('files')
    uploaded_files = []
    extracted_data_list = []

    for file in files:
        if file and file.filename:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(filepath)  # Save the file
            
            # Read the image from the file
            img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
            extracted_data = extract_text_with_boxes(img)
            rois = draw_provisional_diagnosis_box_and_extract_rois(img, extracted_data)

            uploaded_files.append(filepath)
            extracted_data_list.append(extracted_data)  # Collect extracted data

    return jsonify({
        'message': 'Files uploaded successfully',
        'files': uploaded_files,
        'extracted_data': extracted_data_list
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
