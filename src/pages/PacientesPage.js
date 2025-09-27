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
    const [editingId, setEditingId] = useState(null); // <-- NUEVO: Para saber si estamos editando o creando
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // <-- NUEVO: Para el modal de confirmación de borrado
    const [pacienteToDelete, setPacienteToDelete] = useState(null); // <-- NUEVO: Para guardar el paciente que se va a borrar

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

    // --- LÓGICA MODIFICADA PARA MANEJAR FORMULARIO Y MODAL ---
    const resetForm = () => {
        setFormData({ nombre: '', fecha_nacimiento: '', sexo: '', telefono: '', direccion: '', email: '' });
        setEditingId(null);
    };
    const handleClickOpen = () => {
        setNewPaciente({ nombre: '', fecha_nacimiento: '', sexo: '', direccion: '', telefono: '', email: '' });
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setNewPaciente({ ...newPaciente, [e.target.name]: e.target.value });
    };

    const handleOpenEdit = (paciente) => {
        setEditingId(paciente.id_paciente);
        // Formateamos la fecha para que sea compatible con el input type="date" (YYYY-MM-DD)
        const formattedDate = paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toISOString().split('T')[0] : '';
        setFormData({
            nombre: paciente.nombre || '',
            fecha_nacimiento: formattedDate,
            sexo: paciente.sexo || '',
            telefono: paciente.telefono || '',
            direccion: paciente.direccion || '',
            email: paciente.email || ''
        });
        setOpen(true);
    };


    const handleSubmit = async () => {
        try {
            if (editingId) {
                // Si hay un ID, estamos actualizando (PUT)
                await api.put(`/pacientes/${editingId}`, formData);
                alert('¡Paciente actualizado exitosamente!');
            } else {
                // Si no hay ID, estamos creando (POST)
                await api.post('/pacientes', formData);
                alert('¡Paciente registrado exitosamente!');
            }
            handleClose();
            fetchPacientes();
        } catch (err) {
            console.error("Error al guardar el paciente:", err);
            alert('Error al guardar el paciente.');
        }
    };

    // --- NUEVAS FUNCIONES PARA MANEJAR EL BORRADO ---
    const handleDeleteOpen = (paciente) => {
        setPacienteToDelete(paciente);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteClose = () => {
        setDeleteConfirmOpen(false);
        setPacienteToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        if (!pacienteToDelete) return;
        try {
            await api.delete(`/pacientes/${pacienteToDelete.id_paciente}`);
            alert('Paciente eliminado exitosamente.');
            handleDeleteClose();
            fetchPacientes();
        } catch (err) {
            console.error("Error al eliminar el paciente:", err);
            alert('Error al eliminar el paciente.');
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
                <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenCreate}>
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
                                <TableCell>{paciente.nombre}</TableCell>
                                <TableCell>{formatDate(paciente.fecha_nacimiento)}</TableCell>
                                <TableCell>{paciente.sexo}</TableCell>
                                <TableCell>{paciente.telefono}</TableCell>
                                <TableCell align="right">
                                    {/* <-- MODIFICADO: Añadimos los onClick a los botones --> */}
                                    <IconButton color="primary" onClick={() => handleOpenEdit(paciente)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDeleteOpen(paciente)}><DeleteOutlineIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal para Registrar y Editar Paciente */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                {/* <-- MODIFICADO: Título dinámico --> */}
                <DialogTitle>{editingId ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}> <TextField required name="nombre" label="Nombre Completo" fullWidth value={formData.nombre} onChange={handleChange} /> </Grid>
                        <Grid item xs={12} sm={6}> <TextField required name="fecha_nacimiento" label="Fecha de Nacimiento" type="date" fullWidth value={formData.fecha_nacimiento} onChange={handleChange} InputLabelProps={{ shrink: true }} /> </Grid>
                        <Grid item xs={12} sm={6}> <TextField name="sexo" label="Sexo" fullWidth value={formData.sexo} onChange={handleChange} /> </Grid>
                        <Grid item xs={12} sm={6}> <TextField name="telefono" label="Teléfono" fullWidth value={formData.telefono} onChange={handleChange} /> </Grid>
                        <Grid item xs={12} sm={6}> <TextField name="email" label="Correo Electrónico" fullWidth value={formData.email} onChange={handleChange} /> </Grid>
                        <Grid item xs={12}> <TextField name="direccion" label="Dirección" fullWidth value={formData.direccion} onChange={handleChange} /> </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* --- NUEVO: Diálogo de Confirmación de Borrado --- */}
            <Dialog open={deleteConfirmOpen} onClose={handleDeleteClose}>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas eliminar a <strong>{pacienteToDelete?.nombre}</strong>? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteClose}>Cancelar</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PacientesPage;