import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, FormControl, InputLabel, Select, MenuItem, DialogContentText
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../utils/api';

const MedicosPage = () => {
    const [medicos, setMedicos] = useState([]);
    const [open, setOpen] = useState(false);

    // Estados para manejar la edición y el borrado ---
    const [isEditing, setIsEditing] = useState(false);
    const [currentMedicoId, setCurrentMedicoId] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [medicoToDelete, setMedicoToDelete] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        tipo: 'Especialista',
        especialidad: '',
        email: '',
        telefono: '',
        costo_consulta: ''
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

    const resetForm = () => {
        setFormData({ nombre: '', tipo: 'Especialista', especialidad: '', email: '', telefono: '', costo_consulta: '' });
        setIsEditing(false);
        setCurrentMedicoId(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    // Función para abrir el modal en modo edición ---
    const handleOpenEdit = (medico) => {
        setIsEditing(true);
        setCurrentMedicoId(medico.id_medico);
        setFormData({
            nombre: medico.nombre,
            tipo: medico.tipo,
            especialidad: medico.especialidad || '',
            email: medico.email || '',
            telefono: medico.telefono || '',
            costo_consulta: medico.costo_consulta || ''
        });
        setOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
            ...(name === 'tipo' && value === 'General' && { especialidad: '' })
        }));
    };

    // crea o actualiza ---
    const handleSubmit = async () => {
        const dataToSend = {
            ...formData,
            especialidad: formData.tipo === 'General' ? null : formData.especialidad,
            costo_consulta: formData.costo_consulta || 0
        };

        try {
            if (isEditing) {
                await api.put(`/medicos/${currentMedicoId}`, dataToSend);
                alert('¡Médico actualizado exitosamente!');
            } else {
                await api.post('/medicos', dataToSend);
                alert('¡Médico registrado exitosamente!');
            }
            handleClose();
            fetchMedicos();
        } catch (err) {
            console.error("Error al registrar el médico:", err);
            alert('Error al registrar el médico.');
        }
    };

    // Funciones para manejar la eliminación ---
    const handleDeleteOpen = (medico) => {
        setMedicoToDelete(medico);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteClose = () => {
        setDeleteConfirmOpen(false);
        setMedicoToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/medicos/${medicoToDelete.id_medico}`);
            alert('Médico desactivado exitosamente.');
            fetchMedicos();
        } catch (err) {
            console.error("Error al desactivar al médico:", err);
            alert('No se pudo desactivar al médico.');
        } finally {
            handleDeleteClose();
        }
    };


    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Médicos
                </Typography>
                <Button variant="contained" startIcon={<MedicalServicesIcon />} onClick={handleOpenCreate}>
                    Registrar Nuevo Médico
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Especialidad</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Costo Consulta (Q)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {medicos.map((medico) => (
                            <TableRow key={medico.id_medico}>
                                <TableCell>{medico.nombre}</TableCell>
                                <TableCell>{medico.tipo}</TableCell>
                                <TableCell>{medico.especialidad || 'N/A'}</TableCell>
                                <TableCell>{parseFloat(medico.costo_consulta).toFixed(2)}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpenEdit(medico)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDeleteOpen(medico)}><DeleteOutlineIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal para Registrar y Editar */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? 'Editar Médico' : 'Registrar Nuevo Médico'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField required name="nombre" label="Nombre Completo" fullWidth value={formData.nombre} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Tipo</InputLabel>
                                <Select name="tipo" label="Tipo" value={formData.tipo} onChange={handleChange}>
                                    <MenuItem value="Especialista">Especialista</MenuItem>
                                    <MenuItem value="General">General</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {formData.tipo === 'Especialista' && (
                            <Grid item xs={12} sm={6}>
                                <TextField required name="especialidad" label="Especialidad" fullWidth value={formData.especialidad} onChange={handleChange} />
                            </Grid>
                        )}
                         <Grid item xs={12} sm={6}>
                            <TextField name="telefono" label="Teléfono" fullWidth value={formData.telefono} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="email" label="Correo Electrónico" type="email" fullWidth value={formData.email} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="costo_consulta" label="Costo Consulta (Q)" type="number" fullWidth value={formData.costo_consulta} onChange={handleChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de Confirmación para Desactivar */}
            <Dialog open={deleteConfirmOpen} onClose={handleDeleteClose}>
                <DialogTitle>Confirmar Desactivación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas desactivar a <strong>{medicoToDelete?.nombre}</strong>? El registro no se borrará permanentemente.
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

export default MedicosPage;