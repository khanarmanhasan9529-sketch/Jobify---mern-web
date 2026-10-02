import React from 'react'; import { createRoot } from 'react-dom/client';
import App from './App.jsx'; import { initDB } from './db.js'; import './index.css';
initDB();
createRoot(document.getElementById('root')).render(<App />);
