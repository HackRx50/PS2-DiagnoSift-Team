// File: src/utils/imageProcessing.js
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision'
import { ApiKeyCredentials } from '@azure/ms-rest-js'
import { GoogleGenerativeAI } from "@google/generative-ai"

const key = import.meta.env.VITE_VISION_KEY
const endpoint = import.meta.env.VITE_VISION_ENDPOINT

// Check if key and endpoint are available
if (!key || !endpoint) {
  console.error('Vision API key or endpoint is missing. Please check your .env file.')
}

const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }), endpoint
)

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

// Rate limiter to control the number of images processed per minute
async function rateLimiter(func, items, rateLimit, onProgress) {
  const interval = 60000 / rateLimit; // Calculate interval between requests (in ms)
  
  const results = [];
  for (let i = 0; i < items.length; i++) {
    // Process the image
    const result = await func(items[i]);
    results.push(result);
    
    // Report progress
    onProgress((i + 1) / items.length);
    
    // If it's not the last item, wait before sending the next request
    if (i < items.length - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  return results;
}

export async function processImages(files, rateLimit = 15, onProgress = () => {}) {
  return rateLimiter(async (file) => {
    try {
      console.log(`Processing file: ${file.name}`);
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      console.log(`[${file.name}] Reading printed text from image...`)
      const printedResult = await readTextFromBuffer(computerVisionClient, buffer)
      console.log(`[${file.name}] Full Vision API response:`, JSON.stringify(printedResult, null, 2))

      const recognizedText = extractRecognizedText(printedResult)
      console.log(`[${file.name}] Extracted text:`, recognizedText)

      console.log(`[${file.name}] Sending recognized text to Gemini for JSON formatting and diagnosis verification...`)
      let jsonData
      let correctedDiagnosis
      let icd10Code
      try {
        jsonData = await sendToGemini(recognizedText)
        correctedDiagnosis = jsonData.provisional_diagnosis || 'Not found'
        icd10Code = jsonData.ICD10_code || 'Not found'
        console.log(`[${file.name}] Gemini response:`, JSON.stringify(jsonData, null, 2))
      } catch (geminiError) {
        console.error(`[${file.name}] Error with Gemini AI:`, geminiError.message)
        console.log(`[${file.name}] Falling back to extracted provisional diagnosis...`)
        correctedDiagnosis = 'Error occurred'
        icd10Code = 'Error occurred'
      }

      return {
        file_name: file.name,
        extracted_diagnosis: recognizedText,
        corrected_diagnosis: correctedDiagnosis,
        icd10_code: icd10Code,
        processing_status: 'Success'
      }
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error.message)
      return {
        file_name: file.name,
        extracted_diagnosis: 'Error occurred',
        corrected_diagnosis: 'Error occurred',
        icd10_code: 'Error occurred',
        processing_status: 'Failed',
        error_message: error.message
      }
    }
  }, files, rateLimit, onProgress);
}

async function readTextFromBuffer(client, buffer) {
  let result = await client.readInStream(buffer)
  let operation = result.operationLocation.split('/').slice(-1)[0]

  while (result.status !== "succeeded") { 
    await new Promise(resolve => setTimeout(resolve, 1000))
    result = await client.getReadResult(operation)
  }
  return result.analyzeResult.readResults
}

function extractRecognizedText(readResults) {
  let allText = ''
  for (const page of readResults) {
    if (page.lines.length) {
      for (const line of page.lines) {
        allText += line.words.map(w => w.text).join(' ') + '\n'
      }
    } else { 
      allText += 'No recognized text.\n'
    }
  }
  return allText
}

async function sendToGemini(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const prompt = `Analyze the following medical text and extract the provisional diagnosis. Create a JSON object with the following keys:
  1. "provisional_diagnosis": The extracted provisional diagnosis.
  2. "ICD10_code": The corresponding ICD-10-CM code for the diagnosis.

  Rules:
  - If the provisional diagnosis is clear and correct, use it as is.
  - Only make minor corrections for obvious typos or standardization.
  - If the diagnosis is unclear or seems incomplete, use the most appropriate term based on the available information.
  - If no clear diagnosis is found, use "Unspecified diagnosis" and code as "R69".
  - Always provide the most specific ICD-10-CM code possible based on the information given.

  Text to analyze:

  ${text}

  Please return only the JSON object, without any additional formatting or explanation.`

  const result = await model.generateContent(prompt)
  const responseText = await result.response.text()
  
  // Remove Markdown code blocks and any leading/trailing whitespace
  const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
  
  try {
    return JSON.parse(cleanedResponse)
  } catch (error) {
    console.error('Error parsing JSON:', error)
    console.log('Raw response:', responseText)
    throw new Error('Failed to parse JSON')
  }
}