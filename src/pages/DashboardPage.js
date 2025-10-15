import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Paper, Grid, Box, ButtonBase } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import allMenuItems from '../components/menuItems';
import PendientesRevision from '../components/PendientesRevision';

const DashboardPage = () => {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setUserRole(decoded.user.nombre_rol);
        }
    }, []);

    // --- LÓGICA DE FILTRADO CORREGIDA ---
    const dashboardItems = userRole
        ? allMenuItems.filter(item => {
            // La única regla que necesitamos es si el rol está permitido.
            const hasPermission = item.allowedRoles.includes(userRole);
            
            // Y no mostramos el botón del propio dashboard.
            const isNotDashboardButton = item.path !== '/dashboard';

            return hasPermission && isNotDashboardButton;
        })
        : [];

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 'bold' }}>
                Bienestar en un Vistazo
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Facilitando tu labor con cada módulo, Tu espacio de cuidado, a un clic
            </Typography>
        </Box>
    );
};

export default DashboardPage;