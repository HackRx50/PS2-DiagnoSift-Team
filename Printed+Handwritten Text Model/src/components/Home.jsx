import React from 'react';
import { Typography, Button, Grid, Card, CardContent, Container, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.05 }}
  >
    <Card className="h-full shadow-lg transition-all duration-300 bg-[#1E1E1E]">
      <CardContent className="text-center p-6">
        <Box className="mb-4 text-4xl text-blue-400">{icon}</Box>
        <Typography variant="h5" component="h3" className="font-bold mb-3 text-gray-200">
          {title}
        </Typography>
        <Typography className="text-gray-400">
          {description}
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <Box className="bg-gradient-to-r from-[#1A1A1A] to-[#2C2C2C] text-white py-16 px-6 relative overflow-hidden rounded-lg">
      <Container maxWidth="lg" className="relative z-10">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography variant="h2" className="font-bold mb-4 text-2xl md:text-3xl">
                Transform Medical Data with AI
              </Typography>
              <Typography variant="body1" className="mb-10 text-gray-400">
                MedXtract uses cutting-edge AI to accurately process medical forms, saving time and reducing errors. Join the digital healthcare revolution today!
              </Typography>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/extract"
                  endIcon={<ArrowForwardIcon />}
                  className="font-bold py-3 px-8 text-lg shadow-lg bg-blue-600 hover:bg-blue-700 transition duration-300"
                >
                  Get Started
                </Button>
              </motion.div>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute right-0 bottom-0 w-1/2 h-full"
        style={{
          backgroundImage: "url('https://raw.githubusercontent.com/onkar69483/MediSync/refs/heads/dev2/Frontend/src/assets/header_img.png')",
          backgroundPosition: 'right bottom',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain'
        }}
      />
    </Box>

      {/* Features Section */}
      <Box className="py-24 bg-[#121212]">
        <Container maxWidth="lg">
          <Typography variant="h2" className="font-bold mb-16 text-center text-gray-200">
            Our Features
          </Typography>
          <Grid container spacing={6} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<AutoFixHighIcon fontSize="inherit" />}
                title="Accurate Extraction"
                description="Our advanced AI algorithms ensure high accuracy in extracting medical diagnoses from handwritten forms."
                delay={0.2}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<SpeedIcon fontSize="inherit" />}
                title="Fast Processing"
                description="Process large volumes of medical forms quickly, saving time and improving efficiency."
                delay={0.4}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                icon={<SecurityIcon fontSize="inherit" />}
                title="Secure & Compliant"
                description="Our system adheres to strict security standards to protect sensitive medical information."
                delay={0.6}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box className="bg-[#1A1A1A] text-white py-16">
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Typography variant="h3" className="font-bold mb-6">
              Ready to Revolutionize Your Medical Data Processing?
            </Typography>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                component={Link}
                to="/extract"
                endIcon={<ArrowForwardIcon />}
                className="font-bold py-3 px-8 text-lg shadow-lg bg-blue-600 hover:bg-blue-700 transition duration-300"
              >
                Get Started Now
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </Box>
    </motion.div>
  );
};

export default Home;