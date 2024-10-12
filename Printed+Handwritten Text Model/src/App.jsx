import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { motion } from 'framer-motion';
import Home from './components/Home';
import About from './components/About';
import Extract from './components/Extract';

function App() {
  const theme = createTheme({
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
        paper: '#1E1E1E',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 30,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box className="min-h-screen bg-[#121212]">
          <AppBar position="static" color="transparent" elevation={0} className="backdrop-filter backdrop-blur-lg bg-opacity-30">
            <Container maxWidth="lg">
              <Toolbar className="justify-between py-4">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography variant="h5" component={Link} to="/" className="font-bold no-underline text-white flex items-center">
                    <LocalHospitalIcon className="mr-2 text-blue-400" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      MedXtract
                    </span>
                  </Typography>
                </motion.div>
                <motion.div 
                  className="flex space-x-6" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {['Home', 'About', 'Extract'].map((item, index) => (
                    <motion.div
                      key={item}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link 
                        to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} 
                        className="text-gray-300 hover:text-white transition-colors duration-200 ease-in-out"
                      >
                        {item}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </Toolbar>
            </Container>
          </AppBar>
          <Container maxWidth="lg" className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/extract" element={<Extract />} />
              </Routes>
            </motion.div>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;