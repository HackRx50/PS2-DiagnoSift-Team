import React from 'react';
import { Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Typography variant="h3" component="h1" className="font-bold mb-6 text-center">
        About MedXtract
      </Typography>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Paper elevation={3} className="p-6 mb-8">
          <Typography variant="body1" paragraph>
            MedXtract is an innovative solution designed to revolutionize the processing of medical forms. Our mission is to improve the efficiency and accuracy of claims processing by digitizing handwritten medical diagnoses.
          </Typography>
          <Typography variant="body1" paragraph>
            Using cutting-edge AI and machine learning technologies, MedXtract can accurately extract medical diagnoses from handwritten input, significantly reducing the time and errors associated with manual data entry.
          </Typography>
        </Paper>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Typography variant="h5" component="h2" className="font-bold mb-4">
          Key Features:
        </Typography>
        <List>
          {[
            { primary: "Accurate Diagnosis Extraction", secondary: "Our system can recognize and identify medical diagnoses from handwritten forms with high accuracy." },
            { primary: "Post-extraction Correction", secondary: "We've implemented an advanced system to identify and fix inaccuracies or errors in the extracted values." },
            { primary: "Efficient Processing", secondary: "MedXtract can handle large volumes of forms quickly, significantly improving the efficiency of claims processing." },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
            >
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={item.primary}
                  secondary={item.secondary}
                />
              </ListItem>
            </motion.div>
          ))}
        </List>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Typography variant="body1" className="mt-6">
          MedXtract is continuously evolving to meet the challenges of medical form processing. We're committed to providing the most accurate, efficient, and user-friendly solution for healthcare providers and insurance companies.
        </Typography>
      </motion.div>
    </motion.div>
  );
};

export default About;