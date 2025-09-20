// src/pages/PacientesPage.js
import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const PacientesPage = () => {
    const [pacientes, setPacientes] = useState([]);
    const [open, setOpen] = useState(false);
    const [newPaciente, setNewPaciente] = useState({
        nombre: '', fecha_nacimiento: '', sexo: '',
        direccion: '', telefono: '', email: ''
    });

    const fetchPacientes = async () => {
        try {
            const res = await api.get('/pacientes');
            setPacientes(res.data);
        } catch (err) {
            console.error("Error al obtener los pacientes:", err);
            alert("No se pudo cargar la lista de pacientes.");
        }
    };

    useEffect(() => {
        fetchPacientes();
    }, []);

    const handleClickOpen = () => {
        setNewPaciente({ nombre: '', fecha_nacimiento: '', sexo: '', direccion: '', telefono: '', email: '' });
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setNewPaciente({ ...newPaciente, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await api.post('/pacientes', newPaciente);
            handleClose();
            fetchPacientes();
            alert('¡Paciente registrado exitosamente!');
        } catch (err) {
            console.error("Error al registrar el paciente:", err);
            alert('Error al registrar el paciente. Verifique los datos.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-GT', options);
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Pacientes
                </Typography>
                <Button variant="contained" startIcon={<PersonAddAlt1Icon />} onClick={handleClickOpen}>
                    Registrar Nuevo Paciente
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fecha de Nacimiento</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Sexo</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pacientes.map((paciente) => (
                            <TableRow key={paciente.id_paciente}>
                                <TableCell>
                                 <Link to={`/pacientes/${paciente.id_paciente}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                 {paciente.nombre}</Link>
                                 </TableCell>
                                <TableCell>{formatDate(paciente.fecha_nacimiento)}</TableCell>
                                <TableCell>{paciente.sexo}</TableCell>
                                <TableCell>{paciente.telefono}</TableCell>
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
                <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField required name="nombre" label="Nombre Completo" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required name="fecha_nacimiento" label="Fecha de Nacimiento" type="date" InputLabelProps={{ shrink: true }} fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="sexo" label="Sexo" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="direccion" label="Dirección" fullWidth multiline rows={2} onChange={handleChange} />
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

export default PacientesPage;