import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { BookingProvider } from './state/BookingContext';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BookingProvider>
      <App />
    </BookingProvider>
  </React.StrictMode>
);
