import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import SpeedTracker from './SpeedTracker';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1d1d1d',
    },
  },
  typography: {
    h2: {
      fontSize: '4rem',
      '@media (min-width:600px)': {
        fontSize: '6rem',
      },
      '@media (max-width:400px)': {
        fontSize: '3rem',
      },
    },
    h4: {
      fontSize: '1.8rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
      '@media (max-width:400px)': {
        fontSize: '1.5rem',
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SpeedTracker />
    </ThemeProvider>
  );
}

export default App;
