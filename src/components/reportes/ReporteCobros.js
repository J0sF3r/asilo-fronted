import React, { useState, useEffect } from 'react';
import {
    Box, Button, FormControl, InputLabel, Select, MenuItem, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Grid, Chip, CircularProgress, Stack
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../utils/api';
import { generarPDFCobros } from './utils/pdfGenerator';
import { generarExcelCobros } from './utils/excelGenerator';

const ReporteCobros = () => {
    const [familiares, setFamiliares] = useState([]);
    const [selectedFamiliar, setSelectedFamiliar] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [datosReporte, setDatosReporte] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFamiliares();
        // Establecer fechas por defecto (último mes)
        const hoy = new Date();
        const haceUnMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
        setFechaInicio(haceUnMes.toISOString().split('T')[0]);
        setFechaFin(hoy.toISOString().split('T')[0]);
    }, []);

    const fetchFamiliares = async () => {
        try {
            const res = await api.get('/familiares');
            setFamiliares(res.data);
        } catch (err) {
            console.error('Error al cargar familiares:', err);
        }
    };

    const generarReporte = async () => {
        if (!selectedFamiliar || !fechaInicio || !fechaFin) {
            alert('Por favor complete todos los campos');
            return;
        }

        setLoading(true);
        try {
            const res = await api.get(`/reportes/cobros/${selectedFamiliar}`, {
                params: { fechaInicio, fechaFin }
            });
            setDatosReporte(res.data);
        } catch (err) {
            console.error('Error al generar reporte:', err);
            alert('No se pudo generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    const handleExportarPDF = () => {
        if (!datosReporte) return;
        const familiar = familiares.find(f => f.id_familiar === parseInt(selectedFamiliar));
        generarPDFCobros(datosReporte, familiar, fechaInicio, fechaFin);
    };

    const handleExportarExcel = () => {
        if (!datosReporte) return;
        const familiar = familiares.find(f => f.id_familiar === parseInt(selectedFamiliar));
        generarExcelCobros(datosReporte, familiar, fechaInicio, fechaFin);
    };

    const handleImprimir = () => {
        window.print();
    };

    const formatCurrency = (amount) => `Q${parseFloat(amount).toFixed(2)}`;

    return (
        <Box>
            {/* Filtros */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Filtros de Búsqueda</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth required>
                            <InputLabel>Familiar</InputLabel>
                            <Select
                                value={selectedFamiliar}
                                label="Familiar"
                                onChange={(e) => setSelectedFamiliar(e.target.value)}
                            >
                                {familiares.map(f => (
                                    <MenuItem key={f.id_familiar} value={f.id_familiar}>
                                        {f.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Fecha Inicio"
                            type="date"
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Fecha Fin"
                            type="date"
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<SearchIcon />}
                            onClick={generarReporte}
                            disabled={loading}
                            sx={{ height: '56px' }}
                        >
                            Generar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Resultados */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {datosReporte && !loading && (
                <>
                    {/* Botones de exportación */}
                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<PictureAsPdfIcon />}
                            onClick={handleExportarPDF}
                        >
                            Exportar PDF
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<TableViewIcon />}
                            onClick={handleExportarExcel}
                        >
                            Exportar Excel
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={handleImprimir}
                        >
                            Imprimir
                        </Button>
                    </Stack>

                    {/* Vista previa del reporte */}
                    <Paper sx={{ p: 3 }} id="reporte-print">
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                Asilo de Ancianos Cabeza de Algodón
                            </Typography>
                            <Typography variant="h6">Reporte de Cobros por Familiar</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Familiar: {familiares.find(f => f.id_familiar === parseInt(selectedFamiliar))?.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Período: {new Date(fechaInicio).toLocaleDateString('es-GT')} - {new Date(fechaFin).toLocaleDateString('es-GT')}
                            </Typography>
                        </Box>

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Fecha</strong></TableCell>
                                        <TableCell><strong>Tipo</strong></TableCell>
                                        <TableCell><strong>Descripción</strong></TableCell>
                                        <TableCell align="right"><strong>Monto Original</strong></TableCell>
                                        <TableCell align="center"><strong>Descuento</strong></TableCell>
                                        <TableCell align="right"><strong>Monto Final</strong></TableCell>
                                        <TableCell align="center"><strong>Estado</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {datosReporte.transacciones.map((t, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{new Date(t.fecha).toLocaleDateString('es-GT')}</TableCell>
                                            <TableCell>{t.tipo}</TableCell>
                                            <TableCell>{t.descripcion}</TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(t.monto_original || t.monto)}
                                            </TableCell>
                                            <TableCell align="center">
                                                {t.descuento_aplicado ? `${t.descuento_aplicado}%` : '-'}
                                            </TableCell>
                                            <TableCell align="right">{formatCurrency(t.monto)}</TableCell>
                                            <TableCell align="center">
                                                {t.estado_pago ? (
                                                    <Chip
                                                        label={t.estado_pago}
                                                        color={t.estado_pago === 'Pagado' ? 'success' : 'warning'}
                                                        size="small"
                                                    />
                                                ) : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Resumen */}
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom><strong>Resumen</strong></Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">Total Cargos:</Typography>
                                    <Typography variant="h6" color="error.main">
                                        {formatCurrency(datosReporte.totalCargos)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">Total Descuentos:</Typography>
                                    <Typography variant="h6" color="success.main">
                                        -{formatCurrency(datosReporte.totalDescuentos)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">Total Pagado:</Typography>
                                    <Typography variant="h6" color="primary.main">
                                        {formatCurrency(datosReporte.totalPagado)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">Balance Pendiente:</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(datosReporte.balancePendiente)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </>
            )}

            {/* Estilos para impresión */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #reporte-print, #reporte-print * {
                        visibility: visible;
                    }
                    #reporte-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </Box>
    );
};

export default ReporteCobros;