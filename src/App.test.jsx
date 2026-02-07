import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders speedometer title', () => {
  render(<App />);
  const titleElement = screen.getByText(/GPS SPEEDOMETER/i);
  expect(titleElement).toBeInTheDocument();
});
