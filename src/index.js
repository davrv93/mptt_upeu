import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Estilos globales personalizados
const globalStyles = `
  :root {
    --primary-color: #003264;
    --secondary-color: #1A8D5A;
    --accent-color: #E97E00;
    --danger-color: #DB0000;
    --info-color: #276CA1;
    --success-color: #08C1B8;
    --light-bg: #EAF8FF;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #F8F9FA;
    line-height: 1.6;
  }

  .btn-primary {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
  }

  .btn-primary:hover {
    background-color: #002050;
    border-color: #002050;
  }

  .text-primary {
    color: var(--primary-color) !important;
  }

  .bg-primary {
    background-color: var(--primary-color) !important;
  }

  .border-primary {
    border-color: var(--primary-color) !important;
  }

  .card {
    border-radius: 12px;
    overflow: hidden;
  }

  .btn {
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .btn:hover {
    transform: translateY(-1px);
  }

  .form-control {
    border-radius: 8px;
    border: 1px solid #DEE2E6;
    transition: border-color 0.2s ease;
  }

  .form-control:focus {
    border-color: var(--secondary-color);
    box-shadow: 0 0 0 0.2rem rgba(26, 141, 90, 0.25);
  }

  .alert {
    border-radius: 10px;
    border: none;
  }

  .navbar-brand {
    font-weight: 600;
  }

  .card-header {
    border-bottom: none;
    font-weight: 600;
  }

  .progress {
    border-radius: 10px;
    overflow: hidden;
  }

  .badge {
    font-weight: 500;
  }

  .list-group-item {
    border-radius: 8px !important;
    margin-bottom: 0.25rem;
  }

  .table th {
    border-top: none;
    background-color: #F8F9FA;
    font-weight: 600;
  }

  .sticky-top {
    z-index: 1020;
  }

  .hover-effect:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .fade-in {
    animation: fadeIn 0.5s ease-in;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .spinner-border-sm {
    width: 1rem;
    height: 1rem;
  }

  .text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .shadow-sm {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
  }

  .shadow {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  }

  /* Scrollbar personalizado */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* Mejoras para móviles */
  @media (max-width: 768px) {
    .container-fluid {
      padding-left: 15px;
      padding-right: 15px;
    }
    
    .card-body {
      padding: 1rem;
    }
    
    .btn-lg {
      padding: 0.75rem 1rem;
      font-size: 1rem;
    }
    
    .sticky-top {
      position: relative !important;
      top: auto !important;
    }
  }

  /* Animaciones suaves */
  .card, .btn, .form-control, .alert {
    transition: all 0.2s ease;
  }

  /* Estados de loading */
  .loading {
    opacity: 0.7;
    pointer-events: none;
  }

  /* Mejoras de accesibilidad */
  .btn:focus, .form-control:focus {
    outline: 2px solid var(--secondary-color);
    outline-offset: 2px;
  }

  /* Toast personalizado */
  .toast-custom {
    border-radius: 10px;
    border: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

// Inyectar estilos globales
const styleSheet = document.createElement('style');
styleSheet.textContent = globalStyles;
document.head.appendChild(styleSheet);

// Configurar título de la página
document.title = 'Editor de Sílabo - Sistema Académico';

// Agregar meta tags para PWA
const metaViewport = document.createElement('meta');
metaViewport.name = 'viewport';
metaViewport.content = 'width=device-width, initial-scale=1, shrink-to-fit=no';
document.head.appendChild(metaViewport);

const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Editor profesional de sílabos académicos con generación de PDF';
document.head.appendChild(metaDescription);

// Inicializar la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);