import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField, Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../utils/api';

const FarmaciaPage = () => {
    const [pendientesVisita, setPendientesVisita] = useState([]);
    const [pendientesFijos, setPendientesFijos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal para confirmar entrega de visita puntual
    const [confirmVisitaModal, setConfirmVisitaModal] = useState({ open: false, data: null });
    
    // Modal para registrar cobro de tratamiento fijo
    const [cobroFijoModal, setCobroFijoModal] = useState({ open: false, data: null });
    const [cobroFijoFormData, setCobroFijoFormData] = useState({ cantidad_dispensada: '', costo_total: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Hacemos las dos llamadas a la API en paralelo
            const [resVisitas, resFijos] = await Promise.all([
                api.get('/farmacia/pendientes-visita'),
                api.get('/farmacia/pendientes-fijos')
            ]);
            setPendientesVisita(resVisitas.data);
            setPendientesFijos(resFijos.data);
        } catch (err) {
            console.error("Error al cargar los pendientes de farmacia:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    // --- Lógica para Medicamentos de Visita ---
    const handleOpenConfirmVisita = (medicamento) => setConfirmVisitaModal({ open: true, data: medicamento });
    const handleCloseConfirmVisita = () => setConfirmVisitaModal({ open: false, data: null });
    const handleConfirmEntregaVisita = async () => {
        const { id_visita, id_medicamento } = confirmVisitaModal.data;
        try {
            await api.put('/farmacia/entregar-visita', { id_visita, id_medicamento });
            handleCloseConfirmVisita();
            fetchData();
            alert('Entrega de visita registrada exitosamente.');
        } catch (err) {
            console.error("Error al registrar la entrega:", err);
            alert(err.response?.data?.msg || 'No se pudo registrar la entrega.');
        }
    };

    // --- Lógica para Tratamientos Fijos ---
    const handleOpenCobroFijo = (tratamiento) => setCobroFijoModal({ open: true, data: tratamiento });
    const handleCloseCobroFijo = () => {
        setCobroFijoModal({ open: false, data: null });
        setCobroFijoFormData({ cantidad_dispensada: '', costo_total: '' });
    };
    const handleCobroFijoChange = (e) => setCobroFijoFormData({ ...cobroFijoFormData, [e.target.name]: e.target.value });
    const handleCobroFijoSubmit = async () => {
        if (!cobroFijoFormData.costo_total) return alert('El costo total es requerido.');
        try {
            const dataToSend = {
                id_tratamiento_fijo: cobroFijoModal.data.id_tratamiento,
                ...cobroFijoFormData
            };
            await api.post('/cobros-medicamentos', dataToSend);
            handleCloseCobroFijo();
            fetchData();
            alert('Cobro de tratamiento fijo registrado exitosamente.');
        } catch (err) {
            console.error("Error al registrar cobro:", err);
            alert('No se pudo registrar el cobro.');
        }
    };

    if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>; }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
                Portal de Farmacia - Entregas Pendientes
            </Typography>

            {/* Tabla para Medicamentos de Visitas Puntuales */}
            <Typography variant="h5" sx={{ mb: 2 }}>Medicamentos de Visitas</Typography>
            <TableContainer component={Paper} sx={{ mb: 5 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Paciente</TableCell>
                            <TableCell>Medicamento</TableCell>
                            <TableCell>Indicaciones</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendientesVisita.length > 0 ? pendientesVisita.map((med) => (
                            <TableRow key={`${med.id_visita}-${med.id_medicamento}`}>
                                <TableCell>{med.nombre_paciente}</TableCell>
                                <TableCell>{med.nombre_medicamento}</TableCell>
                                <TableCell>{med.indicaciones}</TableCell>
                                <TableCell align="right">
                                    <Button variant="contained" size="small" startIcon={<CheckCircleIcon />} onClick={() => handleOpenConfirmVisita(med)}>
                                        Confirmar Entrega
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={4} align="center">No hay medicamentos de visitas pendientes.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Tabla para Tratamientos Fijos Recurrentes */}
            <Typography variant="h5" sx={{ mb: 2 }}>Tratamientos Fijos Recurrentes</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Paciente</TableCell>
                            <TableCell>Medicamento</TableCell>
                            <TableCell>Última Entrega</TableCell>
                            <TableCell align="right">Acción</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendientesFijos.length > 0 ? pendientesFijos.map((item) => (
                            <TableRow key={item.id_tratamiento}>
                                <TableCell>{item.nombre_paciente}</TableCell>
                                <TableCell>{item.nombre_medicamento}</TableCell>
                                <TableCell>{item.ultima_fecha ? new Date(item.ultima_fecha).toLocaleDateString('es-GT') : 'Nunca'}</TableCell>
                                <TableCell align="right">
                                    <Button variant="contained" size="small" color="secondary" onClick={() => handleOpenCobroFijo(item)}>
                                        Dispensar y Registrar Cobro
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={4} align="center">No hay tratamientos fijos pendientes de dispensar.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Confirmación para Medicamentos de Visita */}
            <Dialog open={confirmVisitaModal.open} onClose={handleCloseConfirmVisita}>
                <DialogTitle>Confirmar Entrega</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Registrar la entrega de <strong>{confirmVisitaModal.data?.nombre_medicamento}</strong> al paciente <strong>{confirmVisitaModal.data?.nombre_paciente}</strong>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmVisita}>Cancelar</Button>
                    <Button onClick={handleConfirmEntregaVisita} variant="contained" autoFocus>Confirmar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal para Registrar Cobro de Tratamiento Fijo */}
            <Dialog open={cobroFijoModal.open} onClose={handleCloseCobroFijo}>
                <DialogTitle>Registrar Dispensación y Cobro</DialogTitle>
                <DialogContent>
                    <Typography variant="h6">{cobroFijoModal.data?.nombre_paciente}</Typography>
                    <Typography variant="body1" gutterBottom>{cobroFijoModal.data?.nombre_medicamento}</Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField name="cantidad_dispensada" label="Cantidad Dispensada (ej: 1 caja)" value={cobroFijoFormData.cantidad_dispensada} onChange={handleCobroFijoChange} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="costo_total" label="Costo Total (Q)" type="number" value={cobroFijoFormData.costo_total} onChange={handleCobroFijoChange} fullWidth required />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCobroFijo}>Cancelar</Button>
                    <Button onClick={handleCobroFijoSubmit} variant="contained">Registrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FarmaciaPage;