import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Paper, Box, Alert, Chip } from '@mui/material';

const SpeedTracker = () => {
  const [speed, setSpeed] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('km/h');

  // Buffer to store recent speeds for smoothing (Moving Average)
  const speedBuffer = useRef([]);
  const BUFFER_SIZE = 5;

  useEffect(() => {
    if (isTracking) {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        return;
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const rawSpeed = position.coords.speed;
          const currentAccuracy = position.coords.accuracy;
          
          setAccuracy(currentAccuracy.toFixed(1));

          if (rawSpeed !== null) {
            // Add new speed to buffer
            speedBuffer.current.push(rawSpeed);
            if (speedBuffer.current.length > BUFFER_SIZE) {
              speedBuffer.current.shift();
            }

            // Calculate moving average
            const avgSpeed = speedBuffer.current.reduce((a, b) => a + b, 0) / speedBuffer.current.length;
            
            let displaySpeed = avgSpeed;
            if (unit === 'km/h') {
              displaySpeed = (avgSpeed * 3.6).toFixed(1);
            } else if (unit === 'mph') {
              displaySpeed = (avgSpeed * 2.23694).toFixed(1);
            }
            
            setSpeed(displaySpeed);
            setError('');
          } else {
            // If speed is null, user might be stationary
            setSpeed(0);
            if (currentAccuracy > 30) {
              setError('Weak GPS signal. Accuracy: ±' + currentAccuracy.toFixed(0) + 'm');
            } else {
              setError('');
            }
          }
        },
        (err) => {
          if (err.code === 1) {
            setError('Geolocation permission denied.');
          } else if (err.code === 2) {
            setError("Position unavailable. Check if GPS is enabled.");
          } else {
            setError(`Error: ${err.message}`);
          }
          setSpeed(0);
          setIsTracking(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
      setWatchId(id);
    } else {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setSpeed(0);
      setAccuracy(null);
      speedBuffer.current = [];
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, unit]);

  const toggleUnit = () => {
    setUnit(prevUnit => (prevUnit === 'km/h' ? 'mph' : 'km/h'));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#121212',
        padding: 2,
      }}
    >
      <Paper elevation={6} sx={{ padding: 4, borderRadius: 4, textAlign: 'center', maxWidth: 400, width: '100%', bgcolor: 'background.paper' }}>
        <Typography variant="h5" color="textSecondary" gutterBottom>
          Real-time Speed
        </Typography>

        {error && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ my: 4 }}>
          <Typography variant="h1" sx={{ fontWeight: 900, color: 'primary.main', mb: 0 }}>
            {speed}
          </Typography>
          <Typography variant="h4" color="textSecondary">
            {unit}
          </Typography>
        </Box>

        {accuracy && (
          <Box sx={{ mb: 3 }}>
            <Chip 
              label={`GPS Accuracy: ±${accuracy}m`} 
              color={accuracy < 20 ? "success" : accuracy < 50 ? "warning" : "error"}
              variant="outlined"
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          {!isTracking ? (
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => setIsTracking(true)}
              sx={{ py: 2, fontSize: '1.2rem', borderRadius: 3 }}
            >
              Start Tracking
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              size="large"
              fullWidth
              onClick={() => setIsTracking(false)}
              sx={{ py: 2, fontSize: '1.2rem', borderRadius: 3 }}
            >
              Stop Tracking
            </Button>
          )}
          
          <Button variant="text" onClick={toggleUnit} sx={{ mt: 1 }}>
            Switch to {unit === 'km/h' ? 'MPH' : 'KM/H'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SpeedTracker;
