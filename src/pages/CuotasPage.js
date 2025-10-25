import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, Chip, IconButton, Tooltip,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import api from '../utils/api';

const CuotasPage = () => {
    const [cuotas, setCuotas] = useState([]);
    const [familiares, setFamiliares] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal de configuración
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id_familiar: '',
        monto: '',
        descripcion: ''
    });

    // Modal de generar cuotas del mes
    const [modalGenerarOpen, setModalGenerarOpen] = useState(false);
    const [generarData, setGenerarData] = useState({
        mes: new Date().getMonth() + 1,
        año: new Date().getFullYear()
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cuotasRes, familiaresRes] = await Promise.all([
                api.get('/cuotas'),
                api.get('/familiares')
            ]);
            setCuotas(cuotasRes.data);
            setFamiliares(familiaresRes.data);
        } catch (err) {
            console.error("Error al cargar datos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // configurar cuota
    const handleOpenModal = (cuota = null) => {
        if (cuota) {
            setFormData({
                id_familiar: cuota.id_familiar,
                monto: cuota.monto,
                descripcion: cuota.descripcion || ''
            });
        } else {
            setFormData({ id_familiar: '', monto: '', descripcion: '' });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setFormData({ id_familiar: '', monto: '', descripcion: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.id_familiar || !formData.monto) {
            alert('Por favor completa los campos requeridos.');
            return;
        }

        try {
            await api.post('/cuotas', formData);
            alert('Cuota configurada exitosamente.');
            handleCloseModal();
            fetchData();
        } catch (err) {
            console.error("Error al configurar cuota:", err);
            alert('No se pudo configurar la cuota.');
        }
    };

    // desactivar cuota
    const handleDesactivar = async (id) => {
        if (!window.confirm('¿Desactivar esta configuración de cuota?')) return;

        try {
            await api.put(`/cuotas/${id}/desactivar`);
            alert('Cuota desactivada.');
            fetchData();
        } catch (err) {
            console.error("Error al desactivar:", err);
            alert('No se pudo desactivar.');
        }
    };

    //Generar Cuotas del Mes
    const handleOpenGenerar = () => setModalGenerarOpen(true);
    const handleCloseGenerar = () => setModalGenerarOpen(false);

    const handleGenerarChange = (e) => {
        setGenerarData({ ...generarData, [e.target.name]: e.target.value });
    };

    const handleGenerarSubmit = async () => {
        try {
            const res = await api.post('/cuotas/generar-mes', generarData);
            alert(`${res.data.generadas} cuotas generadas. ${res.data.yaExistentes} ya existían.`);
            handleCloseGenerar();
        } catch (err) {
            console.error("Error al generar cuotas:", err);
            alert('No se pudieron generar las cuotas.');
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
                    Gestión de Cuotas Mensuales
                </Typography>
                <Box>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        startIcon={<CalendarMonthIcon />} 
                        onClick={handleOpenGenerar}
                        sx={{ mr: 2 }}
                    >
                        Generar Cuotas del Mes
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<AddCircleOutlineIcon />} 
                        onClick={() => handleOpenModal()}
                    >
                        Configurar Cuota
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Familiar</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell align="right">Monto Mensual</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Fecha Inicio</TableCell>
                            <TableCell align="center">Estado</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cuotas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No hay configuraciones de cuotas
                                </TableCell>
                            </TableRow>
                        ) : (
                            cuotas.map((c) => (
                                <TableRow key={c.id_cuota}>
                                    <TableCell>{c.nombre_familiar}</TableCell>
                                    <TableCell>{c.email}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(c.monto)}
                                    </TableCell>
                                    <TableCell>{c.descripcion || '-'}</TableCell>
                                    <TableCell>
                                        {new Date(c.fecha_inicio).toLocaleDateString('es-GT')}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip 
                                            label={c.activo ? 'Activa' : 'Inactiva'}
                                            color={c.activo ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            {c.activo && (
                                                <>
                                                    <Tooltip title="Editar">
                                                        <IconButton size="small" color="primary" onClick={() => handleOpenModal(c)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Desactivar">
                                                        <IconButton size="small" color="error" onClick={() => handleDesactivar(c.id_cuota)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal Configurar Cuota */}
            <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>Configurar Cuota Mensual</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Familiar</InputLabel>
                                <Select
                                    name="id_familiar"
                                    value={formData.id_familiar}
                                    label="Familiar"
                                    onChange={handleChange}
                                >
                                    {familiares.map(f => (
                                        <MenuItem key={f.id_familiar} value={f.id_familiar}>
                                            {f.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="monto"
                                label="Monto Mensual (Q)"
                                type="number"
                                fullWidth
                                required
                                value={formData.monto}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="descripcion"
                                label="Descripción (opcional)"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.descripcion}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal Generar Cuotas del Mes */}
            <Dialog open={modalGenerarOpen} onClose={handleCloseGenerar} maxWidth="sm" fullWidth>
                <DialogTitle>Generar Cuotas del Mes</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Esto creará un cargo de "Cuota Mensual" para todos los familiares con configuración activa.
                    </Typography>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Mes</InputLabel>
                                <Select
                                    name="mes"
                                    value={generarData.mes}
                                    label="Mes"
                                    onChange={handleGenerarChange}
                                >
                                    {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
                                      .map((mes, idx) => (
                                        <MenuItem key={idx + 1} value={idx + 1}>{mes}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="año"
                                label="Año"
                                type="number"
                                fullWidth
                                required
                                value={generarData.año}
                                onChange={handleGenerarChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGenerar}>Cancelar</Button>
                    <Button onClick={handleGenerarSubmit} variant="contained" color="secondary">
                        Generar Cuotas
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CuotasPage;