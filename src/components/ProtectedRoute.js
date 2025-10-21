// src/components/ProtectedRoute.js
/*import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Si no hay token, redirige a la página de login
        return <Navigate to="/login" />;
    }

    // Si hay un token, muestra el contenido que protege
    return children;
};

export default ProtectedRoute;*/

// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000; // tiempo actual en segundos

    if (decoded.exp < now) {
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;