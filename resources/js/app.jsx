import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './MainApp'
import './bootstrap'

// Mount the React app into the <div id="app"> in the Blade template
ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
