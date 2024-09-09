import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/AnimeAPI.jsx'
import './components/AnimeAPI.css'
import 'bootstrap/dist/css/bootstrap.min.css';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
