import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
    Typography, Box, Paper, CircularProgress, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, Grid, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../utils/api';

const EstadoCuentaPage = () => {
    const { id } = useParams();
    const [estadoCuenta, setEstadoCuenta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalPagoOpen, setModalPagoOpen] = useState(false);
    const [pagoData, setPagoData] = useState({ monto: '', descripcion: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/familiares/${id}/estado-de-cuenta`);
            setEstadoCuenta(res.data);
        } catch (err) {
            console.error("Error al obtener el estado de cuenta:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);


    const formatCurrency = (amount) => `Q${parseFloat(amount).toFixed(2)}`;

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (!estadoCuenta) {
        return <Typography>No se pudo cargar el estado de cuenta.</Typography>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Button component={RouterLink} to="/familiares" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Volver a Familiares
            </Button>

            {/* Resumen del Estado de Cuenta */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" gutterBottom>Estado de Cuenta</Typography>
                
                <Grid container spacing={3} sx={{ mt: 1, mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">Total Cargos</Typography>
                            <Typography variant="h5" color="error.main">
                                {formatCurrency(estadoCuenta.totalCargos)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">Total Descuentos</Typography>
                            <Typography variant="h5" color="success.main">
                                -{formatCurrency(estadoCuenta.totalDescuentos)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">Balance Pendiente</Typography>
                            <Typography variant="h5" color={parseFloat(estadoCuenta.balance) > 0 ? 'error' : 'success'}>
                                {formatCurrency(estadoCuenta.balance)}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Historial de Transacciones */}
            <Typography variant="h5" sx={{ mb: 2 }}>Historial de Transacciones</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell align="right">Monto Original</TableCell>
                            <TableCell align="right">Descuento</TableCell>
                            <TableCell align="right">Monto Final</TableCell>
                            <TableCell align="center">Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {estadoCuenta.transacciones.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No hay transacciones registradas
                                </TableCell>
                            </TableRow>
                        ) : (
                            estadoCuenta.transacciones.map((t) => (
                                <TableRow key={t.id_movimiento}>
                                    <TableCell>{new Date(t.fecha).toLocaleDateString('es-GT')}</TableCell>
                                    <TableCell>{t.tipo}</TableCell>
                                    <TableCell>{t.descripcion}</TableCell>
                                    <TableCell align="right">
                                        {t.monto_original ? formatCurrency(t.monto_original) : '-'}
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: 'success.main' }}>
                                        {t.descuento_aplicado ? `${t.descuento_aplicado}%` : '-'}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: t.tipo.startsWith('Cargo') ? 'error.main' : 'success.main' }}>
                                        {formatCurrency(t.monto)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip 
                                            label={t.estado_pago || 'Pendiente'} 
                                            color={t.estado_pago === 'Pagado' ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default EstadoCuentaPage;