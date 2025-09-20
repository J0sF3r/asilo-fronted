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

const MedicamentosPage = () => {
    const [medicamentos, setMedicamentos] = useState([]);
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMedicamento, setCurrentMedicamento] = useState({
        id_medicamento: null,
        nombre: '', 
        descripcion: '',
        costo: ''
    });

    const fetchMedicamentos = async () => {
        try {
            const res = await api.get('/medicamentos');
            setMedicamentos(res.data);
        } catch (err) {
            console.error("Error al obtener los medicamentos:", err);
        }
    };

    useEffect(() => {
        fetchMedicamentos();
    }, []);

    const handleOpen = (medicamento = null) => {
        if (medicamento) {
            setIsEditing(true);
            setCurrentMedicamento(medicamento);
        } else {
            setIsEditing(false);
            setCurrentMedicamento({
                id_medicamento: null,
                nombre: '', 
                descripcion: '',
                costo: ''
            });
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setCurrentMedicamento({ ...currentMedicamento, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const { id_medicamento, ...data } = currentMedicamento;
        try {
            if (isEditing) {
                await api.put(`/medicamentos/${id_medicamento}`, data);
            } else {
                await api.post('/medicamentos', data);
            }
            handleClose();
            fetchMedicamentos();
            alert(`Medicamento ${isEditing ? 'actualizado' : 'creado'} exitosamente.`);
        } catch (err) {
            console.error("Error al guardar el medicamento:", err);
            alert('No se pudo guardar el medicamento.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este medicamento?')) {
            try {
                await api.delete(`/medicamentos/${id}`);
                fetchMedicamentos();
                alert('Medicamento eliminado exitosamente.');
            } catch (err) {
                console.error("Error al eliminar el medicamento:", err);
                alert('No se pudo eliminar el medicamento.');
            }
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Medicamentos
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Añadir Medicamento
                </Button>
            </Box>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre del Medicamento</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Costo (Q)</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {medicamentos.map((medicamento) => (
                            <TableRow key={medicamento.id_medicamento}>
                                <TableCell>{medicamento.nombre}</TableCell>
                                <TableCell>{medicamento.descripcion || 'N/A'}</TableCell>
                                <TableCell>{parseFloat(medicamento.costo).toFixed(2)}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen(medicamento)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(medicamento.id_medicamento)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? 'Editar Medicamento' : 'Añadir Nuevo Medicamento'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={8}>
                            <TextField name="nombre" label="Nombre del Medicamento" fullWidth required value={currentMedicamento.nombre} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField name="costo" label="Costo" type="number" fullWidth required value={currentMedicamento.costo} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="descripcion" label="Descripción" fullWidth multiline rows={3} value={currentMedicamento.descripcion} onChange={handleChange} />
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

export default MedicamentosPage;