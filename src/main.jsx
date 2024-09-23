import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './test/RecipeAPI.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './test/RecipeAPI.css'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
