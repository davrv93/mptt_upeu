import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import TemplateBuilder from './TemplateBuilder';
import SyllabusEditor from './SyllabusEditor';

const App = () => {
  return (
    <Router>
      <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Inicio</Link>
        <Link to="/plantilla" style={{ marginRight: '1rem' }}>Crear Plantilla</Link>
        <Link to="/editor">Llenar Sílabo</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plantilla" element={<TemplateBuilder />} />
        <Route path="/editor" element={<SyllabusEditor />} />
      </Routes>
    </Router>
  );
};

export default App;