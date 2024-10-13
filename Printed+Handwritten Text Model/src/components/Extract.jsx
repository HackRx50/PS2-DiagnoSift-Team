import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Typography, Box, Container, Paper, CircularProgress, Grid, Button } from '@mui/material';
import ImageUpload from '../components/ImageUpload';
import ResultsDisplay from '../components/ResultsDisplay';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const Extract = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleImageUpload = async (files) => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setError(null);

    const processedResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('image', file);  // Make sure this matches the backend expectation

      try {
        const response = await axios.post('http://localhost:8000/api/process-image/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        processedResults.push({
          ...response.data,
          processing_status: 'Success',
        });
      } catch (error) {
        console.error('Error processing image:', error);
        setError(error.response?.data?.error || 'An error occurred while processing the image');
        processedResults.push({
          file_name: file.name,
          extracted_diagnosis: 'Error',
          corrected_diagnosis: 'Error',
          icd10_code: 'Error',
          processing_status: 'Error',
        });
      }

      setProgress((i + 1) / files.length);
    }

    setResults(processedResults);
    setIsProcessing(false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        
        {/* Hero Section */}
        <Box sx={{ my: 5, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom className="text-white font-bold">
            Extract Medical Diagnoses from Images
          </Typography>
          <Typography variant="h6" component="p" className="text-gray-400">
            Our AI-powered tool processes handwritten medical forms and extracts diagnoses quickly and accurately. Upload your images and let AI handle the rest!
          </Typography>
        </Box>
        
        {/* Upload Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 6, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center' }}>
          <CloudUploadIcon fontSize="large" color="primary" sx={{ fontSize: 50 }} />
          <Typography variant="h5" gutterBottom className="text-white">
            Upload Medical Forms
          </Typography>
          <Typography variant="body2" gutterBottom className="text-gray-400 mb-4">
            Supported formats: JPG, PNG, PDF. Ensure the handwriting is clear for the best results.
          </Typography>
          <ImageUpload onUpload={handleImageUpload} isProcessing={isProcessing} progress={progress} />

          {isProcessing && (
            <Box className="mr-3" sx={{ mt: 4, display: 'flex', alignItems: 'center',  justifyContent: 'center'}}>
              <CircularProgress color="primary" size={24} />
              <Typography variant="body2" className="text-gray-400">
                Processing images... {Math.round(progress * 100)}%
              </Typography>
            </Box>
          )}

          {/* {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )} */}

        </Paper>

        {/* Results Section */} 
        {results.length > 0 && (
          <Paper elevation={3} sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom className="text-white">
              Extraction Results
            </Typography>
            <Typography variant="body2" gutterBottom className="text-gray-400 mb-4">
              Below are the diagnoses extracted from the uploaded images.
            </Typography>
            <ResultsDisplay results={results} />
          </Paper>
        )}
        
        {/* Additional Information */}
        <Box sx={{ my: 5, textAlign: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom className="text-white">
            How It Works
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom className="text-white">
                1. Upload Your Image
              </Typography>
              <Typography className="text-gray-400">
                Simply drag and drop or upload an image of the medical form. Our system processes JPG, PNG, and PDF files.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom className="text-white">
                2. AI Processes the Data
              </Typography>
              <Typography className="text-gray-400">
                Our AI algorithms analyze and extract text, recognizing the medical diagnosis from handwritten or typed data.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom className="text-white">
                3. View Results Instantly
              </Typography>
              <Typography className="text-gray-400">
                In just a few seconds, view the extracted diagnoses and save time in handling medical documentation.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Extract;