import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import api from '../utils/api';

const TransaccionesPage = () => {
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para el modal
    const [modalOpen, setModalOpen] = useState(false);
    const [isGasto, setIsGasto] = useState(false);
    const [formData, setFormData] = useState({
        tipo: '',
        descripcion: '',
        monto: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/transacciones');
            setTransacciones(res.data);
        } catch (err) {
            console.error("Error al cargar transacciones:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (gasto = false) => {
        setIsGasto(gasto);
        setFormData({ tipo: gasto ? 'Gasto Operativo' : '', descripcion: '', monto: '' });
        setModalOpen(true);
    };

    const handleCloseModal = () => setModalOpen(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        let montoFinal = parseFloat(formData.monto);
        if (isGasto && montoFinal > 0) {
            montoFinal = -montoFinal; // Los gastos se guardan como negativos
        }

        try {
            await api.post('/transacciones', { ...formData, monto: montoFinal });
            alert('Transacción registrada exitosamente.');
            handleCloseModal();
            fetchData();
        } catch (err) {
            console.error("Error al registrar la transacción:", err);
            alert('No se pudo registrar la transacción.');
        }
    };

    const formatCurrency = (amount) => `Q${parseFloat(amount).toFixed(2)}`;

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Caja y Transacciones
                </Typography>
                <Box>
                    <Button variant="contained" color="error" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenModal(true)} sx={{ mr: 2 }}>
                        Registrar Gasto
                    </Button>
                    <Button variant="contained" color="success" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenModal(false)}>
                        Registrar Ingreso
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell align="right">Monto</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transacciones.map((t) => (
                            <TableRow key={t.id_transaccion}>
                                <TableCell>{new Date(t.fecha).toLocaleDateString('es-GT')}</TableCell>
                                <TableCell>{t.tipo}</TableCell>
                                <TableCell>{t.descripcion}</TableCell>
                                <TableCell align="right" sx={{ color: t.monto < 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                                    {formatCurrency(t.monto)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal para Registrar Ingreso/Gasto */}
            <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>{isGasto ? 'Registrar Nuevo Gasto' : 'Registrar Nuevo Ingreso'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Tipo de {isGasto ? 'Gasto' : 'Ingreso'}</InputLabel>
                                <Select name="tipo" value={formData.tipo} label="Tipo" onChange={handleChange}>
                                    {isGasto ? (
                                        [<MenuItem key="gasto_op" value="Gasto Operativo">Gasto Operativo</MenuItem>,
                                         <MenuItem key="pago_serv" value="Pago de Servicios">Pago de Servicios</MenuItem>]
                                    ) : (
                                        [<MenuItem key="dona" value="Ingreso por Donación">Ingreso por Donación</MenuItem>,
                                         <MenuItem key="cuota" value="Ingreso por Cuota Mensual">Ingreso por Cuota Mensual</MenuItem>]
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="descripcion" label="Descripción" fullWidth required value={formData.descripcion} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="monto" label="Monto (Q)" type="number" fullWidth required value={formData.monto} onChange={handleChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TransaccionesPage;