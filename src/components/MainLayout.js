import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; 
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material'; 
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard'; 

const MainLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole'); 
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Asilo de Ancianos Cabeza de Algodón
                    </Typography>
                    
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