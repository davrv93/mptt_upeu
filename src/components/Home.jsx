import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const loadExample = async () => {
    try {
      const response = await fetch('/silabo_ejemplo.json');
      const data = await response.json();
      localStorage.setItem('mptt_template', JSON.stringify(data));
      alert('Sílabo de ejemplo cargado correctamente.');
      navigate('/plantilla');
    } catch (error) {
      alert('Error al cargar el archivo de ejemplo.');
      console.error(error);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('mptt_template');
    alert('Plantilla eliminada.');
  };

  return (
    <div className="container mt-5">
      <h1 className="text-primary">Editor de Sílabo</h1>
      <p className="lead">Selecciona una acción:</p>
      <ul className="list-group mb-4">
        <li className="list-group-item">
          <Link to="/plantilla" className="btn btn-outline-primary">➕ Crear Plantilla</Link>
        </li>
        <li className="list-group-item">
          <Link to="/editor" className="btn btn-outline-primary">✍️ Llenar Datos del Sílabo</Link>
        </li>
      </ul>
      <button className="btn btn-success me-2" onClick={loadExample}>📂 Cargar Sílabo Ejemplo</button>
      <button className="btn btn-danger" onClick={clearStorage}>🗑️ Limpiar Plantilla</button>
    </div>
  );
};

export default Home;