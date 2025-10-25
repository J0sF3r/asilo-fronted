// src/pages/LoginPage.js

import React, { useState } from 'react';
import api from '../utils/api';
import { Avatar, Button, TextField, Box, Typography, Container, CssBaseline } from '@mui/material';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const { username, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { username, password });
            
            // Guardamos el token Y el rol del usuario en el localStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userRole', res.data.rol); 
            
            // Redirigimos a TODOS los usuarios a la página principal
            navigate('/'); 

        } catch (err) {
            console.error(err);
            alert('Credenciales inválidas. Por favor, intente de nuevo.');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline /> 
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <CottageOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Bienvenido al Sistema 
                </Typography>
                <Typography component="h4" variant="h7">
                      Asilo de Ancianos Cabeza de Algodón
                </Typography>
                <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Usuario"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={onChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Contraseña"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={onChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Ingresar
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default LoginPage;