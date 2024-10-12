# Printed + Handwritten Text Extraction Model

This project is a React application that allows users to upload images containing printed or handwritten text. The app uses the Microsoft Vision API for text extraction and sends the results to Gemini AI for further processing and formatting. Users can upload images, view extracted text, and export results to an Excel file.

## Project Structure

```
📦Printed+Handwritten Text Model
┣ 📂constants           # Configuration and constants used across the app
┃ ┗ 📜constants.js
┣ 📂node_modules         # Project dependencies (automatically generated)
┣ 📂public               # Static assets such as favicon and HTML entry
┣ 📂src
 ┣ 📂assets              # Image and media files used in the app
 ┣ 📂components          # React components for various parts of the app
 ┃ ┣ 📜About.jsx         # About page component
 ┃ ┣ 📜Extract.jsx       # Main extraction process component
 ┃ ┣ 📜Home.jsx          # Home page component
 ┃ ┣ 📜ImageUpload.jsx   # Component for uploading images
 ┃ ┗ 📜ResultsDisplay.jsx# Component for displaying extraction results
 ┣ 📂utils               # Utility functions for processing images and generating Excel
 ┃ ┣ 📜excelGenerator.js # Function to generate Excel file from extracted data
 ┃ ┗ 📜imageProcessing.js# Image processing logic and API calls
 ┣ 📜App.jsx             # Main app component
 ┣ 📜index.css           # Global styles
 ┣ 📜main.jsx            # App entry point
 ┗ 📜theme.js            # Tailwind theme customization
┣ 📜.env                 # Environment variables (e.g., API keys)
┣ 📜.gitignore           # Git ignore file
┣ 📜eslint.config.js     # Linting configuration
┣ 📜index.html           # HTML entry point for the app
┣ 📜package-lock.json    # Lock file for package versions
┣ 📜package.json         # Project dependencies and scripts
┣ 📜postcss.config.js    # PostCSS configuration
┣ 📜README.md            # Documentation for this project
┣ 📜tailwind.config.js   # Tailwind CSS configuration
┗ 📜vite.config.js       # Vite bundler configuration
```

## Features

- **Image Upload**: Upload images containing printed or handwritten text.
- **Text Extraction**: Extract text using the Microsoft Vision API.
- **Gemini AI Processing**: Process the extracted text with Gemini AI for formatting and structuring.
- **Results Display**: View extracted and processed text.
- **Export to Excel**: Download the results as an Excel file.

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v14 or higher)
- **npm** or **yarn**

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd Printed+Handwritten Text Model
   ```

3. Install the dependencies:

   Using npm:
   ```bash
   npm install
   ```

   Or using yarn:
   ```bash
   yarn install
   ```

4. Set up your environment variables. Create a `.env` file in the root directory(Printed+Handwritten Text Model) and add the necessary API keys:

   ```bash
   VITE_VISION_KEY=your_vision_api_key
   VITE_VISION_ENDPOINT=your_vision_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

### Running the Application

To start the application in development mode:

```bash
npm run dev
```

This will start a development server at `http://localhost:5173/`.

## Usage

1. **Upload an Image**: On the homepage, use the image upload component to select an image with printed or handwritten text.
2. **Extract Text**: Once the image is uploaded, click the "Extract" button to process the image with Microsoft Vision API.
3. **View Results**: After extraction, view the extracted and processed text in the results section.
4. **Export to Excel**: Optionally, export the results to an Excel file for further use.

## Technologies Used

- **React**: Frontend library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Microsoft Vision API**: For text extraction from images.
- **Gemini AI**: For further processing and formatting of the extracted text.
- **Vite**: Fast build tool for bundling the project.