import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { BookingProvider } from './state/BookingContext';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BookingProvider>
        <App />
      </BookingProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
