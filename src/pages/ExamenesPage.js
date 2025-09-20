// src/pages/ExamenesPage.js
import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../utils/api';

const ExamenesPage = () => {
    const [examenes, setExamenes] = useState([]);
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentExamen, setCurrentExamen] = useState({
        id_examen: null,
        nombre_examen: '',
        descripcion: '',
        costo: ''
    });

    const fetchExamenes = async () => {
        try {
            const res = await api.get('/examenes');
            setExamenes(res.data);
        } catch (err) {
            console.error("Error al obtener los exámenes:", err);
        }
    };

    useEffect(() => {
        fetchExamenes();
    }, []);

    const handleOpen = (examen = null) => {
        if (examen) {
            setIsEditing(true);
            setCurrentExamen(examen);
        } else {
            setIsEditing(false);
            setCurrentExamen({ id_examen: null, nombre_examen: '', descripcion: '', costo: '' });
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setCurrentExamen({ ...currentExamen, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const { id_examen, ...data } = currentExamen;
        try {
            if (isEditing) {
                await api.put(`/examenes/${id_examen}`, data);
            } else {
                await api.post('/examenes', data);
            }
            handleClose();
            fetchExamenes();
            alert(`Examen ${isEditing ? 'actualizado' : 'creado'} exitosamente.`);
        } catch (err) {
            console.error("Error al guardar el examen:", err);
            alert('No se pudo guardar el examen.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este examen?')) {
            try {
                await api.delete(`/examenes/${id}`);
                fetchExamenes();
                alert('Examen eliminado exitosamente.');
            } catch (err) {
                console.error("Error al eliminar el examen:", err);
                alert('No se pudo eliminar el examen.');
            }
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Exámenes
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Añadir Examen
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre del Examen</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Costo (Q)</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {examenes.map((examen) => (
                            <TableRow key={examen.id_examen}>
                                <TableCell>{examen.nombre_examen}</TableCell>
                                <TableCell>{examen.descripcion || 'N/A'}</TableCell>
                                <TableCell>{parseFloat(examen.costo).toFixed(2)}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen(examen)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(examen.id_examen)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? 'Editar Examen' : 'Añadir Nuevo Examen'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField name="nombre_examen" label="Nombre del Examen" fullWidth required value={currentExamen.nombre_examen} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="costo" label="Costo" type="number" fullWidth required value={currentExamen.costo} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="descripcion" label="Descripción" fullWidth multiline rows={3} value={currentExamen.descripcion} onChange={handleChange} />
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

export default ExamenesPage;