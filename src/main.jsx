import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from '../Contexts/toast-Contex.jsx'
import { ConfirmProvider } from '../Contexts/confirm-context';
import { SidebarProvider } from '../Contexts/sidebar-context.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </ConfirmProvider>  
    </ToastProvider>
  </StrictMode>,
)
