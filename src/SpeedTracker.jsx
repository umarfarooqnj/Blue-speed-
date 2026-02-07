import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Paper, Box, Alert, Chip, LinearProgress } from '@mui/material';

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * 
 * @param {number} lat1 - Latitude of the first point in degrees.
 * @param {number} lon1 - Longitude of the first point in degrees.
 * @param {number} lat2 - Latitude of the second point in degrees.
 * @param {number} lon2 - Longitude of the second point in degrees.
 * @returns {number} The distance between the points in meters.
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * SpeedTracker Component
 * 
 * A React component that tracks and displays real-time speed using the browser's Geolocation API.
 * Features include:
 * - Speed display in KM/H or MPH.
 * - Signal accuracy tracking and visualization.
 * - Fallback manual speed calculation if the device doesn't provide it directly.
 * - Speed smoothing using a rolling average buffer.
 * 
 * @returns {JSX.Element} The rendered SpeedTracker UI.
 */
const SpeedTracker = () => {
  const [rawSpeed, setRawSpeed] = useState(0); // Speed in meters per second
  const [accuracy, setAccuracy] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('km/h');

  // Refs for persistent data between renders
  const lastPosition = useRef(null);
  const lastTimestamp = useRef(null);
  const speedBuffer = useRef([]);
  const BUFFER_SIZE = 3;

  useEffect(() => {
    let watchId = null;

    if (isTracking) {
      if (!navigator.geolocation) {
        setError('Geolocation not supported');
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed: gpsSpeed, accuracy: currentAccuracy } = position.coords;
          const timestamp = position.timestamp;
          
          setAccuracy(currentAccuracy);

          let calculatedSpeed = gpsSpeed;

          // FALLBACK: Manual calculation if GPS speed is null
          if (gpsSpeed === null && lastPosition.current) {
            const distance = calculateDistance(
              lastPosition.current.latitude,
              lastPosition.current.longitude,
              latitude,
              longitude
            );
            const timeDiff = (timestamp - lastTimestamp.current) / 1000;
            
            if (timeDiff > 0 && distance > 0.5) {
              calculatedSpeed = distance / timeDiff;
            } else {
              calculatedSpeed = 0;
            }
          }

          // FILTER: Ignore GPS noise
          if (calculatedSpeed < 0.2 || calculatedSpeed === null) calculatedSpeed = 0;

          // SMOOTHING
          speedBuffer.current.push(calculatedSpeed);
          if (speedBuffer.current.length > BUFFER_SIZE) speedBuffer.current.shift();
          const avgSpeed = speedBuffer.current.reduce((a, b) => a + b, 0) / speedBuffer.current.length;
          
          setRawSpeed(avgSpeed);

          lastPosition.current = { latitude, longitude };
          lastTimestamp.current = timestamp;
          setError('');
        },
        (err) => {
          setError(err.code === 1 ? 'Permission Denied' : 'Signal Lost');
          setIsTracking(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setRawSpeed(0);
      setAccuracy(null);
      lastPosition.current = null;
      lastTimestamp.current = null;
      speedBuffer.current = [];
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]); // Removed 'unit' to prevent restart on toggle

  // Unit conversion logic
  const displaySpeed = unit === 'km/h' 
    ? (rawSpeed * 3.6).toFixed(1) 
    : (rawSpeed * 2.23694).toFixed(1);

  const signalQuality = accuracy ? Math.max(0, Math.min(100, 100 - (accuracy / 2))) : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#0a0a0a', p: 2 }}>
      <Paper elevation={12} sx={{ p: 4, borderRadius: 6, textAlign: 'center', maxWidth: 400, width: '100%', bgcolor: '#1a1a1a', border: '1px solid #333' }}>
        
        <Typography variant="overline" sx={{ color: '#888', letterSpacing: 2 }}>
          GPS SPEEDOMETER
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box sx={{ my: 4 }}>
          <Typography variant="h1" sx={{ fontWeight: 900, color: '#00e5ff', fontSize: '6rem', textShadow: '0 0 20px rgba(0,229,255,0.3)' }}>
            {displaySpeed}
          </Typography>
          <Typography variant="h5" sx={{ color: '#888', mt: -1 }}>
            {unit.toUpperCase()}
          </Typography>
        </Box>

        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#666' }}>SIGNAL QUALITY</Typography>
            <Typography variant="caption" sx={{ color: accuracy && accuracy < 20 ? '#4caf50' : '#ff9800' }}>
               ±{accuracy ? accuracy.toFixed(1) : '0'}m
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={signalQuality} 
            sx={{ height: 6, borderRadius: 3, bgcolor: '#333', '& .MuiLinearProgress-bar': { bgcolor: signalQuality > 70 ? '#4caf50' : '#ff9800' } }} 
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Button
            variant={isTracking ? "outlined" : "contained"}
            color={isTracking ? "error" : "primary"}
            size="large"
            fullWidth
            onClick={() => setIsTracking(!isTracking)}
            sx={{ py: 2, borderRadius: 4, fontWeight: 'bold' }}
          >
            {isTracking ? "STOP TRACKING" : "START TRACKING"}
          </Button>
          
          <Button variant="text" onClick={() => setUnit(u => u === 'km/h' ? 'mph' : 'km/h')} sx={{ color: '#666' }}>
            USE {unit === 'km/h' ? 'MPH' : 'KM/H'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SpeedTracker;
