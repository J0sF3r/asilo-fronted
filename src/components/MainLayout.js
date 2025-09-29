// src/components/MainLayout.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link as RouterLink } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';

const MainLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Asilo de Ancianos Cabeza de Algodon
                    </Typography>

                     <IconButton
                    color="inherit"
                    component={RouterLink}
                    to="/"
                    aria-label="ir al dashboard"
                    title="Ir al Dashboard" // Texto que aparece al pasar el mouse
                >
                    <DashboardIcon />
                </IconButton>
                
                    <Button color="inherit" endIcon={<LogoutIcon />}  onClick={handleLogout}>Cerrar Sesión</Button>
                </Toolbar>
            </AppBar>
            <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout;