import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Home from './Home';
import TemplateBuilder from './TemplateBuilder';
import SyllabusEditor from './SyllabusEditor';
import OAuth2Callback from './OAuth2Callback';
import UserProfile from './UserProfile';

const protectedRoutes = [
  {
    path: '/',
    element: <Home />,
    title: 'Dashboard'
  },
  {
    path: '/plantilla',
    element: <TemplateBuilder />,
    title: 'Crear Plantilla'
  },
  {
    path: '/editor',
    element: <SyllabusEditor />,
    title: 'Editor de Sílabo'
  },
  {
    path: '/perfil',
    element: <UserProfile />,
    title: 'Mi Perfil'
  }
];

const publicRoutes = [
  {
    path: '/auth/callback',
    element: <OAuth2Callback />,
    title: 'Callback OAuth2'
  }
];


const AppRoutes = () => {
  return (
    <Routes>
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}

      {protectedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ProtectedRoute>
              {
                route.element
              }
            </ProtectedRoute>
          }
        />
      ))}

      <Route
        path="*"
        element={
          <ProtectedRoute>
          <Navigate to="/" replace />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;