import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // Initialize i18n
import App from './App.tsx'

// Ensure document direction is set to LTR on initial load
// Both English and Amharic use left-to-right direction
document.documentElement.dir = 'ltr';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
