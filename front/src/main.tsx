import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SupChat from './Pages/index'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupChat />
  </StrictMode>,
)
