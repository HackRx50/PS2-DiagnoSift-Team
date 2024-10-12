import cv from '@techstark/opencv-js';
import Tesseract from 'tesseract.js';
import { StringSimilarity } from 'string-similarity-js';

// Step 1: Skew correction
function correctSkew(image, delta = 1, limit = 5) {
  return new Promise((resolve) => {
    const determineScore = (arr, angle) => {
      const data = new cv.Mat();
      const M = cv.getRotationMatrix2D(new cv.Point(arr.cols / 2, arr.rows / 2), angle, 1);
      cv.warpAffine(arr, data, M, new cv.Size(arr.cols, arr.rows), cv.INTER_NEAREST, cv.BORDER_CONSTANT, new cv.Scalar());
      const sum = cv.reduce(data, new cv.Mat(), cv.REDUCE_SUM, -1);
      const histogram = cv.reduce(sum, new cv.Mat(), cv.REDUCE_SUM, 0);
      const score = cv.norm(histogram, cv.NORM_L1);
      data.delete(); M.delete(); sum.delete(); histogram.delete();
      return score;
    };

    const gray = new cv.Mat();
    cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);
    const thresh = new cv.Mat();
    cv.threshold(gray, thresh, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

    const scores = [];
    const angles = Array.from({ length: Math.floor(2 * limit / delta) + 1 }, (_, i) => -limit + i * delta);
    angles.forEach(angle => {
      const score = determineScore(thresh, angle);
      scores.push(score);
    });

    const bestAngle = angles[scores.indexOf(Math.max(...scores))];

    const [h, w] = [image.rows, image.cols];
    const center = new cv.Point(w / 2, h / 2);
    const M = cv.getRotationMatrix2D(center, bestAngle, 1.0);
    const corrected = new cv.Mat();
    cv.warpAffine(image, corrected, M, new cv.Size(w, h), cv.INTER_CUBIC, cv.BORDER_REPLICATE);

    gray.delete(); thresh.delete(); M.delete();
    resolve(corrected);
  });
}

// Step 2: Orientation correction
async function correctImageOrientation(image) {
  const [h, w] = [image.rows, image.cols];

  if (h < 800 || w < 800) {
    return image;
  }

  const { data: { rotate } } = await Tesseract.recognize(image, 'eng', { logger: m => console.log(m) });
  const angle = rotate;

  if (angle !== 0) {
    const center = new cv.Point(w / 2, h / 2);
    const M = cv.getRotationMatrix2D(center, -angle, 1.0);
    const rotated = new cv.Mat();
    cv.warpAffine(image, rotated, M, new cv.Size(w, h), cv.INTER_CUBIC, cv.BORDER_REPLICATE);
    M.delete();
    return rotated;
  }
  return image;
}

// Step 3: Preprocess image
function preprocessImage(img) {
  return new Promise(async (resolve) => {
    const correctedImg = await correctImageOrientation(img);
    const gray = new cv.Mat();
    cv.cvtColor(correctedImg, gray, cv.COLOR_RGBA2GRAY);
    const [origHeight, origWidth] = [gray.rows, gray.cols];
    let [height, width] = [origHeight, origWidth];
    let scaleFactor = 1;

    if (height < 800 || width < 800) {
      scaleFactor = 2;
      const resized = new cv.Mat();
      cv.resize(gray, resized, new cv.Size(0, 0), scaleFactor, scaleFactor, cv.INTER_LANCZOS4);
      gray.delete();
      gray = resized;
    }

    const processedImage = new cv.Mat();
    cv.adaptiveThreshold(gray, processedImage, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 65, 13);

    gray.delete();
    resolve({ processedImage, scaleFactor, origWidth, origHeight });
  });
}

// Step 4: Extract text with bounding boxes
async function extractTextWithBoxes(image) {
  const { processedImage, scaleFactor, origWidth, origHeight } = await preprocessImage(image);
  const { data: { words } } = await Tesseract.recognize(processedImage, 'eng', { logger: m => console.log(m) });

  const extractedData = words.map(word => ({
    text: word.text.trim(),
    box: {
      x: Math.floor(word.bbox.x0 / scaleFactor),
      y: Math.floor(word.bbox.y0 / scaleFactor),
      width: Math.floor((word.bbox.x1 - word.bbox.x0) / scaleFactor),
      height: Math.floor((word.bbox.y1 - word.bbox.y0) / scaleFactor)
    }
  })).filter(item => item.text);

  const resizedImage = new cv.Mat();
  cv.resize(image, resizedImage, new cv.Size(origWidth, origHeight), 0, 0, cv.INTER_LANCZOS4);

  processedImage.delete();
  return { resizedImage, extractedData };
}

// Step 5: Draw provisional diagnosis box and extract ROIs
function drawProvisionalDiagnosisBoxAndExtractROIs(image, extractedData) {
  const rois = [];
  const [height, width] = [image.rows, image.cols];
  let bestMatch = null;
  let highestRatio = 0;

  extractedData.forEach(item => {
    const { text, box } = item;
    if (isSimilarToDiagnosis(text)) {
      const ratio = StringSimilarity.compareTwoStrings(text.toLowerCase(), "diagnosis");
      if (ratio > highestRatio) {
        highestRatio = ratio;
        bestMatch = item;
      }
    }
  });

  if (bestMatch && (height >= 800 && width >= 800)) {
    const box = bestMatch.box;
    cv.rectangle(image,
      new cv.Point(box.x + 200, box.y - 40),
      new cv.Point(width, box.y + box.height + 30),
      new cv.Scalar(0, 255, 0), 2);
    const roi = image.roi(new cv.Rect(box.x + 200, box.y - 40, width - (box.x + 200), box.height + 70));
    rois.push(roi);
  }

  return rois;
}

// Helper function to check similarity to "diagnosis"
function isSimilarToDiagnosis(text, threshold = 0.5) {
  const keywords = ["diagnosis"];
  return keywords.some(keyword => StringSimilarity.compareTwoStrings(text.toLowerCase(), keyword) >= threshold);
}

// Function to draw bounding box if image size is less than 800
function drawBoundingBox(image) {
  const [height, width] = [image.rows, image.cols];
  const x = Math.floor(0.4 * width);
  const y = Math.floor(0.25 * height);
  const boxWidth = width;
  const boxHeight = Math.floor(0.1 * height);

  cv.rectangle(image, new cv.Point(x, y), new cv.Point(x + boxWidth, y + boxHeight), new cv.Scalar(0, 255, 0), 2);

  return { x, y, boxWidth, boxHeight };
}

// Main flow
export async function processImage(imageData) {
  return new Promise(async (resolve) => {
    cv.onRuntimeInitialized = async () => {
      const image = cv.matFromImageData(imageData);

      // Step 1: Skew correction
      const skewCorrectedImage = await correctSkew(image);

      // Check image size and draw bounding box if necessary
      const rois = [];
      const [height, width] = [skewCorrectedImage.rows, skewCorrectedImage.cols];

      if (height < 800 || width < 800) {
        const boundingBoxCoords = drawBoundingBox(skewCorrectedImage);
        const roi = skewCorrectedImage.roi(new cv.Rect(boundingBoxCoords.x, boundingBoxCoords.y, boundingBoxCoords.boxWidth, boundingBoxCoords.boxHeight));
        rois.push(roi);
      }

      // Step 2: Extract text and draw diagnosis box for larger images
      const { resizedImage, extractedData } = await extractTextWithBoxes(skewCorrectedImage);
      const diagnosisROIs = drawProvisionalDiagnosisBoxAndExtractROIs(resizedImage, extractedData);
      rois.push(...diagnosisROIs);

      // Convert the processed image and ROIs to ImageData for display
      const processedImageData = new ImageData(
        new Uint8ClampedArray(resizedImage.data),
        resizedImage.cols,
        resizedImage.rows
      );

      const roiImageDataArray = rois.map(roi => new ImageData(
        new Uint8ClampedArray(roi.data),
        roi.cols,
        roi.rows
      ));

      // Clean up
      image.delete();
      skewCorrectedImage.delete();
      resizedImage.delete();
      rois.forEach(roi => roi.delete());

      resolve({
        processedImage: processedImageData,
        rois: roiImageDataArray,
        extractedData
      });
    };
  });
}