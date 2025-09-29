import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, DialogContentText
} from '@mui/material';
import EscalatorWarningIcon from '@mui/icons-material/EscalatorWarning';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../utils/api';

const EnfermerosPage = () => {
    const [enfermeros, setEnfermeros] = useState([]);
    const [open, setOpen] = useState(false);

    // --- NUEVO: Estados para manejar la edición y el borrado ---
    const [isEditing, setIsEditing] = useState(false);
    const [currentEnfermeroId, setCurrentEnfermeroId] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [enfermeroToDelete, setEnfermeroToDelete] = useState(null);

    const [formData, setFormData] = useState({
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

    const resetForm = () => {
        setFormData({ nombre: '', telefono: '', email: '' });
        setIsEditing(false);
        setCurrentEnfermeroId(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    // --- NUEVO: Función para abrir el modal en modo edición ---
    const handleOpenEdit = (enfermero) => {
        setIsEditing(true);
        setCurrentEnfermeroId(enfermero.id_enfermero);
        setFormData({
            nombre: enfermero.nombre,
            telefono: enfermero.telefono,
            email: enfermero.email
        });
        setOpen(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- MODIFICADO: handleSubmit ahora crea o actualiza ---
    const handleSubmit = async () => {
        try {
            if (isEditing) {
                await api.put(`/enfermeros/${currentEnfermeroId}`, formData);
                alert('¡Datos actualizados exitosamente!');
            } else {
                await api.post('/enfermeros', formData);
                alert('¡Enfermero/a registrado exitosamente!');
            }
            handleClose();
            fetchEnfermeros();
        } catch (err) {
            console.error("Error al registrar:", err);
            alert('Error al registrar.');
        }
    };

    // --- NUEVO: Funciones para manejar la eliminación ---
    const handleDeleteOpen = (enfermero) => {
        setEnfermeroToDelete(enfermero);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteClose = () => {
        setDeleteConfirmOpen(false);
        setEnfermeroToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/enfermeros/${enfermeroToDelete.id_enfermero}`);
            alert('Enfermero/a desactivado/a exitosamente.');
            fetchEnfermeros();
        } catch (err) {
            console.error("Error al desactivar:", err);
            alert('No se pudo desactivar el registro.');
        } finally {
            handleDeleteClose();
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Enfermería
                </Typography>
                <Button variant="contained" startIcon={<EscalatorWarningIcon />} onClick={handleOpenCreate}>
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
                                    {/* --- MODIFICADO: Se añaden los onClick a los botones --- */}
                                    <IconButton color="primary" onClick={() => handleOpenEdit(enfermero)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDeleteOpen(enfermero)}><DeleteOutlineIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal para Registrar y Editar */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                {/* --- MODIFICADO: Título dinámico --- */}
                <DialogTitle>{isEditing ? 'Editar Personal de Enfermería' : 'Registrar Nuevo Personal de Enfermería'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField required name="nombre" label="Nombre Completo" fullWidth value={formData.nombre} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="telefono" label="Teléfono" fullWidth value={formData.telefono} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="email" label="Correo Electrónico" type="email" fullWidth value={formData.email} onChange={handleChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* --- NUEVO: Diálogo de Confirmación para Desactivar --- */}
            <Dialog open={deleteConfirmOpen} onClose={handleDeleteClose}>
                <DialogTitle>Confirmar Desactivación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas desactivar a <strong>{enfermeroToDelete?.nombre}</strong>? El registro no se borrará permanentemente.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteClose}>Cancelar</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                        Desactivar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EnfermerosPage;