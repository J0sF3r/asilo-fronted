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

    const dashboardItems = userRole
        ? allMenuItems.filter(item => {
            // Condición 1: El rol debe tener permiso
            if (!item.allowedRoles.includes(userRole)) {
                return false;
            }
            // Condición 2 (CORREGIDA): Ocultamos los portales solo si el rol NO es Administración
            if (userRole !== 'Administración' && ['/laboratorio', '/farmacia'].includes(item.path)) {
                return false;
            }
            // Condición 3: Siempre ocultamos la tarjeta del propio dashboard
            if (item.path === '/dashboard') {
                return false;
            }
            return true;
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

            {(userRole === 'Administración' || userRole === 'Medico General') && <PendientesRevision />}

            <Grid container spacing={4}>
                {dashboardItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.text}>
                        <ButtonBase 
                            component={Link} 
                            to={item.path}
                            sx={{ 
                                width: '100%', 
                                height: '100%', 
                                borderRadius: 2, 
                                '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' },
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', width: '100%', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 2 }}>
                                {React.cloneElement(item.icon, { sx: { fontSize: 50 }, color: "primary" })}
                                <Typography variant="h6" component="h2" sx={{ mt: 2, fontWeight: 500 }}>
                                    {item.text}
                                </Typography>
                            </Paper>
                        </ButtonBase>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default DashboardPage;