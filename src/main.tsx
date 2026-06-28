import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HERO_IMAGE_URLS, MENU_IMAGE_URLS } from './data/constants';
import { ensureStorage } from './lib/storage';
import { preloadImages } from './utils/preloadImages';
import './index.css';

ensureStorage();
preloadImages([...MENU_IMAGE_URLS, ...HERO_IMAGE_URLS, '/images/soccer-ball.png', '/images/soccer-ball@2x.png']);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);