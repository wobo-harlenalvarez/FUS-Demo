import { FusProvider } from '@workboard/wobo-fus'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { woboConfig } from './woboConfig'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FusProvider config={woboConfig}>
      <App />
    </FusProvider>
  </React.StrictMode>
)
