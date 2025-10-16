import React, { useState } from 'react';
import {
    Box, Button, TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Typography, Grid, Chip, CircularProgress, Stack
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../utils/api';
import { generarPDFEntradas } from './utils/pdfGenerator';
import { generarExcelEntradas } from './utils/excelGenerator';

const ReporteEntradas = () => {
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [datosReporte, setDatosReporte] = useState(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const hoy = new Date();
        const haceUnMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
        setFechaInicio(haceUnMes.toISOString().split('T')[0]);
        setFechaFin(hoy.toISOString().split('T')[0]);
    }, []);

    const generarReporte = async () => {
        if (!fechaInicio || !fechaFin) {
            alert('Por favor complete todos los campos');
            return;
        }

        setLoading(true);
        try {
            const res = await api.get('/reportes/entradas', {
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
        generarPDFEntradas(datosReporte, fechaInicio, fechaFin);
    };

    const handleExportarExcel = () => {
        if (!datosReporte) return;
        generarExcelEntradas(datosReporte, fechaInicio, fechaFin);
    };

    const handleImprimir = () => {
        window.print();
    };

    const formatCurrency = (amount) => `Q${parseFloat(amount).toFixed(2)}`;

    const getTipoColor = (tipo) => {
        if (tipo.includes('Donación')) return 'success';
        if (tipo === 'Cuota Mensual' || tipo === 'Pago') return 'primary';
        return 'info';
    };

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Filtros de Búsqueda</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={4}>
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
                    <Grid item xs={12} md={4}>
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
                    <Grid item xs={12} md={4}>
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

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {datosReporte && !loading && (
                <>
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

                    <Paper sx={{ p: 3 }} id="reporte-print">
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <img 
                                src="/logo-asilo.png" 
                                alt="Logo Asilo" 
                                style={{ height: '60px', marginBottom: '10px' }}
                                className="logo-print"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                Asilo de Ancianos Cabeza de Algodón
                            </Typography>
                            <Typography variant="h6">Reporte de Entradas (Donaciones y Cobros)</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Período: {fechaInicio.split('-').reverse().join('/')} - {fechaFin.split('-').reverse().join('/')}
                            </Typography>
                        </Box>

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Fecha</strong></TableCell>
                                        <TableCell><strong>Tipo</strong></TableCell>
                                        <TableCell><strong>Descripción</strong></TableCell>
                                        <TableCell><strong>Origen</strong></TableCell>
                                        <TableCell align="right"><strong>Monto</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {datosReporte.transacciones.map((t, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{new Date(t.fecha).toLocaleDateString('es-GT')}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={t.tipo} 
                                                    color={getTipoColor(t.tipo)} 
                                                    size="small" 
                                                />
                                            </TableCell>
                                            <TableCell>{t.descripcion}</TableCell>
                                            <TableCell>{t.nombre_familiar || t.nombre_donante || 'N/A'}</TableCell>
                                            <TableCell align="right">{formatCurrency(t.monto)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom><strong>Resumen de Ingresos</strong></Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">Donaciones:</Typography>
                                    <Typography variant="h6" color="success.main">
                                        {formatCurrency(datosReporte.totalDonaciones)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">Cobros/Cuotas:</Typography>
                                    <Typography variant="h6" color="primary.main">
                                        {formatCurrency(datosReporte.totalCobros)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">Otros Ingresos:</Typography>
                                    <Typography variant="h6" color="info.main">
                                        {formatCurrency(datosReporte.totalOtrosIngresos)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">Total General:</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(datosReporte.totalGeneral)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </>
            )}

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #reporte-print, #reporte-print * { visibility: visible; }
                    #reporte-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .logo-print { display: block !important; margin: 0 auto 10px; }
                    @page { margin: 2cm; }
                }
            `}</style>
        </Box>
    );
};

export default ReporteEntradas;