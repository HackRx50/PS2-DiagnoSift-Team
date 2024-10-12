import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Typography, Box, Container, Paper, CircularProgress, Grid, Button } from '@mui/material';
import ImageUpload from '../components/ImageUpload';
import ResultsDisplay from '../components/ResultsDisplay';
import { processImages } from '../utils/imageProcessing';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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

  const handleImageUpload = async (files) => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const processedResults = await processImages(files, 15, (progress) => {
        setProgress(progress);
      });
      setResults(processedResults);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsProcessing(false);
    }
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

          {/* Loading Indicator */}
          {isProcessing && (
            <Box sx={{ mt: 4 }}>
              <CircularProgress color="primary" />
              <Typography variant="body2" className="text-gray-400 mt-2">
                Processing images... {progress}%
              </Typography>
            </Box>
          )}
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

          {/* Button for Redirect */}
          <Box sx={{ mt: 5 }}>
            <Button
              variant="contained"
              color="secondary"
              href="https://krhh5ptj-8501.inc1.devtunnels.ms/"
              target="_blank"
              className='mt-3 mb-4'
            >
              Use our Printed Text Model
            </Button>
            <Typography variant="body2" className="text-gray-400 mt-5">
              For printed forms, use our dedicated tool for better accuracy in text extraction.
            </Typography>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Extract;
