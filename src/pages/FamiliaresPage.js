// src/pages/FamiliaresPage.js
import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../utils/api';

const FamiliaresPage = () => {
    const [familiares, setFamiliares] = useState([]);
    const [open, setOpen] = useState(false);
    const [newFamiliar, setNewFamiliar] = useState({
        nombre: '', parentesco: '', telefono: '', email: ''
    });

    const fetchFamiliares = async () => {
        try {
            const res = await api.get('/familiares');
            setFamiliares(res.data);
        } catch (err) {
            console.error("Error al obtener los familiares:", err);
            alert("No se pudo cargar la lista de familiares.");
        }
    };

    useEffect(() => {
        fetchFamiliares();
    }, []);

    const handleClickOpen = () => {
        setNewFamiliar({ nombre: '', parentesco: '', telefono: '', email: '' });
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setNewFamiliar({ ...newFamiliar, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await api.post('/familiares', newFamiliar);
            handleClose();
            fetchFamiliares();
            alert('¡Familiar registrado exitosamente!');
        } catch (err) {
            console.error("Error al registrar el familiar:", err);
            alert('Error al registrar el familiar. Verifique los datos.');
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Familiares
                </Typography>
                <Button variant="contained" startIcon={<GroupAddIcon />} onClick={handleClickOpen}>
                    Registrar Nuevo Familiar
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Parentesco</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {familiares.map((familiar) => (
                            <TableRow key={familiar.id_familiar}>
                                <TableCell>{familiar.nombre}</TableCell>
                                <TableCell>{familiar.parentesco}</TableCell>
                                <TableCell>{familiar.telefono}</TableCell>
                                <TableCell>{familiar.email}</TableCell>
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
                <DialogTitle>Registrar Nuevo Familiar</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField required name="nombre" label="Nombre Completo" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="parentesco" label="Parentesco" fullWidth onChange={handleChange} />
                        </Grid>
                         <Grid item xs={12} sm={6}>
                            <TextField required name="telefono" label="Teléfono" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
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

export default FamiliaresPage;