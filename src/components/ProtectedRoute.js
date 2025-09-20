// src/components/ProtectedRoute.js
import React from 'react';
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

export default ProtectedRoute;