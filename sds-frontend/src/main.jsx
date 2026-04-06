/**
 * @file main.jsx
 * @description Raíz de renderizado de la aplicación React (Frontend).
 * Aquí se inicializa la inyección del árbol de componentes en el DOM usando StrictMode.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
