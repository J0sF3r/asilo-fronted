import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Typography, Box, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../utils/api';

const EstadoCuentaPage = () => {
    const { id } = useParams(); // Obtiene el ID del familiar desde la URL
    const [estadoCuenta, setEstadoCuenta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEstadoCuenta = async () => {
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
        fetchEstadoCuenta();
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
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" gutterBottom>Estado de Cuenta</Typography>
                <Typography variant="h5" color={estadoCuenta.balance < 0 ? 'error' : 'success'}>
                    Balance Actual: <strong>{formatCurrency(estadoCuenta.balance)}</strong>
                </Typography>
            </Paper>

            <Typography variant="h5" sx={{ mb: 2 }}>Historial de Transacciones</Typography>
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
                        {estadoCuenta.transacciones.map((t, index) => (
                            <TableRow key={index}>
                                <TableCell>{new Date(t.fecha).toLocaleDateString('es-GT')}</TableCell>
                                <TableCell>{t.tipo}</TableCell>
                                <TableCell>{t.descripcion}</TableCell>
                                <TableCell align="right" sx={{ color: t.monto < 0 ? 'error.main' : 'success.main' }}>
                                    {formatCurrency(t.monto)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default EstadoCuentaPage;