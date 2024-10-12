# Text Extraction Models

This repository contains two Models: 

1. **Printed + Handwritten Text Extraction Model**
2. **Printed Text Extraction Model**

Both projects focus on extracting text from images or PDFs, but they have distinct features and use cases. The **Printed + Handwritten Text Extraction Model** processes printed or handwritten text from images, while the **Medical Data Extractor** focuses on analyzing text from medical documents in PDF format. Below are the details for each project.

---

## 1. Printed + Handwritten Text Extraction Model

This project is a React application that allows users to upload images containing printed or handwritten text. The app uses the **Microsoft Vision API** for text extraction and sends the results to **Gemini AI** for further processing and formatting. Users can upload images, view extracted text, and export the results to an Excel file.

### Features

- **Image Upload**: Upload images containing printed or handwritten text.
- **Text Extraction**: Extract text using the Microsoft Vision API.
- **Gemini AI Processing**: Process the extracted text with Gemini AI for formatting and structuring.
- **Results Display**: View extracted and processed text.
- **Export to Excel**: Download the results as an Excel file.

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd Printed+Handwritten Text Model
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file:
   ```bash
   VITE_VISION_KEY=your_vision_api_key
   VITE_VISION_ENDPOINT=your_vision_endpoint
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the application:
   ```bash
   npm run dev
   ```

---

## 2. Printed Text Extraction Modelr

This project extracts and analyzes data from medical documents (such as prescriptions and patient details) using PDF and image processing. The backend is built with **Python**, while the frontend is built using **Streamlit**.

### Features

- Extract data from medical documents in PDF format.
- Use **Tesseract OCR** for text recognition.
- Display and download extracted data in Excel format.
- Interactive frontend built using **Streamlit**.

### Installation

#### 1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd Printed Text Model
   ```

#### 2. Set up a Python virtual environment:

- For **Windows**:
  ```bash
  python -m venv venv
  ```

- For **macOS/Linux**:
  ```bash
  python3 -m venv venv
  ```

#### 3. Activate the virtual environment:

- For **Windows**:
  ```bash
  venv\Scripts\activate
  ```

- For **macOS/Linux**:
  ```bash
  source venv/bin/activate
  ```

#### 4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

#### 5. Install **Poppler** and **Tesseract OCR**:

##### Installing **Poppler**:

**Windows**:
1. Download the latest version of Poppler from [Poppler for Windows](http://blog.alivate.com.au/poppler-windows/).
2. Extract the ZIP file to a folder (e.g., `C:\poppler`).
3. Add the `bin` folder to your PATH environment variable:
   - Open Control Panel -> System -> Advanced System Settings -> Environment Variables.
   - Under "System variables," find the `Path` variable, and click "Edit."
   - Add a new entry with the path to the Poppler `bin` folder (e.g., `C:\poppler\bin`).
   
**macOS**:
   ```bash
   brew install poppler
   ```

**Linux**:
   ```bash
   sudo apt install poppler-utils
   ```

##### Installing **Tesseract OCR**:

**Windows**:
1. Download the latest version of Tesseract from [Tesseract for Windows](https://github.com/UB-Mannheim/tesseract/wiki).
2. Install Tesseract and take note of the installation directory (e.g., `C:\Program Files\Tesseract-OCR`).
3. Add the installation directory to your PATH environment variable:
   - Open Control Panel -> System -> Advanced System Settings -> Environment Variables.
   - Under "System variables," find the `Path` variable, and click "Edit."
   - Add a new entry with the path to the Tesseract installation directory (e.g., `C:\Program Files\Tesseract-OCR`).

**macOS**:
   ```bash
   brew install tesseract
   ```

**Linux**:
   ```bash
   sudo apt install tesseract-ocr
   ```

#### 6. Running the Project

1. Start the backend:
   ```bash
   cd Printed Text Model/medical-data-extraction/backend
   python src/main.py
   ```

2. Run the frontend:
   ```bash
   cd Printed Text Model/medical-data-extraction/frontend
   streamlit run app.py
   ```