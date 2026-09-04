import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppProviders from './app/providers';
import { installMonacoCanceledErrorFilter } from './utils/monacoHelpers.js';
import './styles/index.css';

installMonacoCanceledErrorFilter();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
);
