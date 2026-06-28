import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ensureStorage } from './lib/storage';
import './index.css';

ensureStorage();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);