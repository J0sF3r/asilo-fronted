// src/pages/MedicosPage.js
import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../utils/api';

const MedicosPage = () => {
    const [medicos, setMedicos] = useState([]);
    const [open, setOpen] = useState(false);
    const [newMedico, setNewMedico] = useState({
        nombre: '',
        tipo: 'Especialista', // Nuevo campo con valor por defecto
        especialidad: '',
        email: '',
        telefono: ''
    });

    const fetchMedicos = async () => {
        try {
            const res = await api.get('/medicos');
            setMedicos(res.data);
        } catch (err) {
            console.error("Error al obtener los médicos:", err);
        }
    };

    useEffect(() => {
        fetchMedicos();
    }, []);

    const handleClickOpen = () => {
        // Resetea el formulario al estado inicial
        setNewMedico({ nombre: '', tipo: 'Especialista', especialidad: '', email: '', telefono: '' });
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewMedico(prevState => ({
            ...prevState,
            [name]: value,
            // Si el tipo cambia a 'General', borramos la especialidad
            ...(name === 'tipo' && value === 'General' && { especialidad: '' })
        }));
    };

    const handleSubmit = async () => {
        // Prepara los datos a enviar, asegurando que especialidad sea null si es General
        const dataToSend = {
            ...newMedico,
            especialidad: newMedico.tipo === 'General' ? null : newMedico.especialidad
        };

        try {
            await api.post('/medicos', dataToSend);
            handleClose();
            fetchMedicos();
            alert('¡Médico registrado exitosamente!');
        } catch (err) {
            console.error("Error al registrar el médico:", err);
            alert('Error al registrar el médico.');
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Médicos
                </Typography>
                <Button variant="contained" startIcon={<MedicalServicesIcon />} onClick={handleClickOpen}>
                    Registrar Nuevo Médico
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell> {/* Nueva Columna */}
                            <TableCell sx={{ fontWeight: 'bold' }}>Especialidad</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {medicos.map((medico) => (
                            <TableRow key={medico.id_medico}>
                                <TableCell>{medico.nombre}</TableCell>
                                <TableCell>{medico.tipo}</TableCell> {/* Nuevo Campo */}
                                <TableCell>{medico.especialidad || 'N/A'}</TableCell> {/* Mostramos N/A si no aplica */}
                                <TableCell>{medico.email}</TableCell>
                                <TableCell>{medico.telefono}</TableCell>
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
                <DialogTitle>Registrar Nuevo Médico</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField required name="nombre" label="Nombre Completo" fullWidth value={newMedico.nombre} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Tipo</InputLabel>
                                <Select name="tipo" label="Tipo" value={newMedico.tipo} onChange={handleChange}>
                                    <MenuItem value="Especialista">Especialista</MenuItem>
                                    <MenuItem value="General">General</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* Este campo solo aparece si el tipo es 'Especialista' */}
                        {newMedico.tipo === 'Especialista' && (
                            <Grid item xs={12} sm={6}>
                                <TextField required name="especialidad" label="Especialidad" fullWidth value={newMedico.especialidad} onChange={handleChange} />
                            </Grid>
                        )}
                         <Grid item xs={12} sm={6}>
                            <TextField name="telefono" label="Teléfono" fullWidth value={newMedico.telefono} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="email" label="Correo Electrónico" type="email" fullWidth value={newMedico.email} onChange={handleChange} />
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

export default MedicosPage;