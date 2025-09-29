import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // <-- 1. Importa RouterLink
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material'; // <-- 2. Importa IconButton
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard'; // <-- 3. Importa el ícono del dashboard

const MainLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole'); // Asegúrate de limpiar también el rol
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Asilo de Ancianos Cabeza de Algodón
                    </Typography>
                    
                    {/* --- 4. AÑADE ESTE BOTÓN AQUÍ --- */}
                    <IconButton
                        color="inherit"
                        component={RouterLink}
                        to="/"
                        aria-label="ir al dashboard"
                        title="Ir al Dashboard"
                    >
                        <DashboardIcon />
                    </IconButton>

                    <Button color="inherit" endIcon={<LogoutIcon />} onClick={handleLogout}>Cerrar Sesión</Button>
                </Toolbar>
            </AppBar>
            <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout;