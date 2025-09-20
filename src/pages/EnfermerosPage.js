// src/pages/EnfermerosPage.js
import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid
} from '@mui/material';
import EscalatorWarningIcon from '@mui/icons-material/EscalatorWarning'; // Icono para enfermería
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../utils/api';

const EnfermerosPage = () => {
    const [enfermeros, setEnfermeros] = useState([]);
    const [open, setOpen] = useState(false);
    const [newEnfermero, setNewEnfermero] = useState({
        nombre: '', telefono: '', email: ''
    });

    const fetchEnfermeros = async () => {
        try {
            const res = await api.get('/enfermeros');
            setEnfermeros(res.data);
        } catch (err) {
            console.error("Error al obtener los enfermeros:", err);
        }
    };

    useEffect(() => {
        fetchEnfermeros();
    }, []);

    const handleClickOpen = () => {
        setNewEnfermero({ nombre: '', telefono: '', email: '' });
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setNewEnfermero({ ...newEnfermero, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await api.post('/enfermeros', newEnfermero);
            handleClose();
            fetchEnfermeros();
            alert('¡Enfermero/a registrado exitosamente!');
        } catch (err) {
            console.error("Error al registrar:", err);
            alert('Error al registrar.');
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Enfermería
                </Typography>
                <Button variant="contained" startIcon={<EscalatorWarningIcon />} onClick={handleClickOpen}>
                    Registrar Nuevo/a
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {enfermeros.map((enfermero) => (
                            <TableRow key={enfermero.id_enfermero}>
                                <TableCell>{enfermero.nombre}</TableCell>
                                <TableCell>{enfermero.telefono}</TableCell>
                                <TableCell>{enfermero.email}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary"><EditIcon /></IconButton>
                                    <IconButton color="error"><DeleteOutlineIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Registrar Nuevo Personal de Enfermería</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField required name="nombre" label="Nombre Completo" fullWidth onChange={handleChange} />
                        </Grid>
                         <Grid item xs={12} sm={6}>
                            <TextField name="telefono" label="Teléfono" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="email" label="Correo Electrónico" type="email" fullWidth onChange={handleChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EnfermerosPage;