from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set the upload folder
UPLOAD_FOLDER = 'uploads'  # Ensure this directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'files' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    files = request.files.getlist('files')
    uploaded_files = []

    for file in files:
        if file and file.filename:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(filepath)  # Save the file
            uploaded_files.append(filepath)

    return jsonify({'message': 'Files uploaded successfully', 'files': uploaded_files}), 200

if __name__ == '__main__':
    app.run(debug=True)
