import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

//console.log(import.meta.env.VITE_SUPABASE_URL)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)