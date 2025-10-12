import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, DialogContentText
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import api from '../utils/api';

const FamiliaresPage = () => {
    const [familiares, setFamiliares] = useState([]);
    const [open, setOpen] = useState(false);

    // --- NUEVO: Estados para manejar la edición y el borrado ---
    const [isEditing, setIsEditing] = useState(false);
    const [currentFamiliarId, setCurrentFamiliarId] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [familiarToDelete, setFamiliarToDelete] = useState(null);

    const [formData, setFormData] = useState({
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

    const resetForm = () => {
        setFormData({ nombre: '', parentesco: '', telefono: '', email: '' });
        setIsEditing(false);
        setCurrentFamiliarId(null);
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
    const handleOpenEdit = (familiar) => {
        setIsEditing(true);
        setCurrentFamiliarId(familiar.id_familiar);
        setFormData({
            nombre: familiar.nombre,
            parentesco: familiar.parentesco,
            telefono: familiar.telefono,
            email: familiar.email
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
                await api.put(`/familiares/${currentFamiliarId}`, formData);
                alert('¡Familiar actualizado exitosamente!');
            } else {
                await api.post('/familiares', formData);
                alert('¡Familiar registrado exitosamente!');
            }
            handleClose();
            fetchFamiliares();
        } catch (err) {
            console.error("Error al registrar el familiar:", err);
            alert('Error al registrar el familiar. Verifique los datos.');
        }
    };

    // --- NUEVO: Funciones para manejar la eliminación ---
    const handleDeleteOpen = (familiar) => {
        setFamiliarToDelete(familiar);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteClose = () => {
        setDeleteConfirmOpen(false);
        setFamiliarToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/familiares/${familiarToDelete.id_familiar}`);
            alert('Familiar desactivado exitosamente.');
            fetchFamiliares(); // Para que el familiar "desaparezca" de la lista
        } catch (err) {
            console.error("Error al desactivar el familiar:", err);
            alert('No se pudo desactivar el familiar.');
        } finally {
            handleDeleteClose();
        }
    };


    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Familiares
                </Typography>
                <Button variant="contained" startIcon={<GroupAddIcon />} onClick={handleOpenCreate}>
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
                                    {/* --- MODIFICADO: Se añaden los onClick a los botones --- */}
                                    <IconButton color="primary" onClick={() => handleOpenEdit(familiar)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDeleteOpen(familiar)}><DeleteOutlineIcon /></IconButton>
                                </TableCell>

                                <TableCell align="right">
                                    <IconButton
                                        color="secondary"
                                        component={RouterLink}
                                        to={`/familiares/${familiar.id_familiar}/estado-de-cuenta`}
                                        title="Ver Estado de Cuenta"
                                    >
                                        <AccountBalanceWalletIcon />
                                    </IconButton>
                                    <IconButton color="primary" onClick={() => handleOpenEdit(familiar)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDeleteOpen(familiar)}><DeleteOutlineIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal para Registrar y Editar Familiar */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                {/* --- MODIFICADO: Título dinámico --- */}
                <DialogTitle>{isEditing ? 'Editar Familiar' : 'Registrar Nuevo Familiar'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField required name="nombre" label="Nombre Completo" fullWidth value={formData.nombre} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="parentesco" label="Parentesco" fullWidth value={formData.parentesco} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required name="telefono" label="Teléfono" fullWidth value={formData.telefono} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="email" label="Correo Electrónico" type="email" fullWidth value={formData.email} onChange={handleChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* --- NUEVO: Diálogo de Confirmación para Eliminar --- */}
            <Dialog open={deleteConfirmOpen} onClose={handleDeleteClose}>
                <DialogTitle>Confirmar Desactivación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas desactivar a <strong>{familiarToDelete?.nombre}</strong>? El familiar no se borrará permanentemente y podrá ser reactivado en el futuro.
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

export default FamiliaresPage;