# Speed Tracker App

A modern, high-accuracy GPS Speedometer built with React 19, MUI 7, and Vite.

## Features

- **Real-time Speed Tracking**: Uses Geolocation API with a fallback manual calculation for high accuracy.
- **Unit Conversion**: Toggle between KM/H and MPH.
- **Signal Quality Indicator**: Visual feedback on GPS accuracy.
- **Modern UI**: Styled with MUI 7 and dark mode.
- **Performance**: Optimized build using Vite.

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

In the project directory, you can run:

#### `npm run dev`

Runs the app in development mode using Vite.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

#### `npm run build`

Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

#### `npm test`

Launches the test runner using Vitest.
It runs the tests in `src/App.test.jsx` to verify the application renders correctly.

#### `npm run preview`

Locally preview the production build.

## Project Structure

- `src/App.jsx`: Main application container with ThemeProvider.
- `src/SpeedTracker.jsx`: Core logic for GPS tracking, distance calculation, and UI.
- `src/main.jsx`: Entry point for the application.
- `index.html`: Main HTML template (root level for Vite).

## Deployment

This project is optimized for deployment on **Vercel**. 
The configuration includes an `.npmrc` file and specific `engines` in `package.json` to ensure a smooth build process.

---

*Note: This project was migrated from Create React App to Vite to resolve dependency conflicts with React 19 and MUI 7.*
