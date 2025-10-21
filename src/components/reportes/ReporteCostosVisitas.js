import React, { useState, useEffect } from 'react';
import {
    Box, Button, FormControl, InputLabel, Select, MenuItem, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Grid, CircularProgress, Stack, Accordion,
    AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../utils/api';
import { generarPDFCostosVisitas } from './utils/pdfGenerator';
import { generarExcelCostosVisitas } from './utils/excelGenerator';

const ReporteCostosVisitas = () => {
    const [pacientes, setPacientes] = useState([]);
    const [selectedPaciente, setSelectedPaciente] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [datosReporte, setDatosReporte] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPacientes();
        const hoy = new Date();
        const haceUnAno = new Date(hoy.getFullYear() - 1, hoy.getMonth(), hoy.getDate());
        setFechaInicio(haceUnAno.toISOString().split('T')[0]);
        setFechaFin(hoy.toISOString().split('T')[0]);
    }, []);

    const fetchPacientes = async () => {
        try {
            const res = await api.get('/pacientes');
            setPacientes(res.data);
        } catch (err) {
            console.error('Error al cargar pacientes:', err);
        }
    };

    const generarReporte = async () => {
        if (!selectedPaciente || !fechaInicio || !fechaFin) {
            alert('Por favor complete todos los campos');
            return;
        }

        setLoading(true);
        try {
            const res = await api.get(`/reportes/costos-visitas/${selectedPaciente}`, {
                params: { 
                    fechaInicio: fechaInicio,
                    fechaFin: fechaFin
                }
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
        generarPDFCostosVisitas(datosReporte, fechaInicio, fechaFin);
    };

    const handleExportarExcel = () => {
        if (!datosReporte) return;
        generarExcelCostosVisitas(datosReporte, fechaInicio, fechaFin);
    };

    const handleImprimir = () => {
        window.print();
    };

    const formatCurrency = (amount) => `Q${parseFloat(amount).toFixed(2)}`;

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Filtros de Búsqueda</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth required>
                            <InputLabel>Paciente (Residente)</InputLabel>
                            <Select
                                value={selectedPaciente}
                                label="Paciente (Residente)"
                                onChange={(e) => setSelectedPaciente(e.target.value)}
                            >
                                {pacientes.map(p => (
                                    <MenuItem key={p.id_paciente} value={p.id_paciente}>
                                        {p.nombre}
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
                            <Typography variant="h6">Reporte de Costos por Visita Médica</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Paciente: {datosReporte.paciente.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Período: {fechaInicio.split('-').reverse().join('/')} - {fechaFin.split('-').reverse().join('/')}
                            </Typography>
                        </Box>

                        {/* Resumen General */}
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', color: 'white', borderRadius: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="body2">Total Visitas:</Typography>
                                    <Typography variant="h6">{datosReporte.cantidadVisitas}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="body2">Total Exámenes:</Typography>
                                    <Typography variant="h6">{formatCurrency(datosReporte.totalExamenes)}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="body2">Total Medicamentos:</Typography>
                                    <Typography variant="h6">{formatCurrency(datosReporte.totalMedicamentos)}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="body2">Total General:</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(datosReporte.totalGeneral)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Detalle por Visita */}
                        {datosReporte.visitas.map((visita, index) => (
                            <Accordion key={index} sx={{ mb: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                Visita del {new Date(visita.fecha_visita).toLocaleDateString('es-GT')}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Médico: {visita.nombre_medico || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label={formatCurrency(visita.total_visita)} 
                                            color="primary" 
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Diagnóstico:</strong> {visita.diagnostico || 'Sin diagnóstico registrado'}
                                        </Typography>

                                        {/* Exámenes */}
                                        {visita.examenes.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    Exámenes Realizados:
                                                </Typography>
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Examen</TableCell>
                                                                <TableCell>Resultado</TableCell>
                                                                <TableCell align="right">Costo</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {visita.examenes.map((ex, idx) => (
                                                                <TableRow key={idx}>
                                                                    <TableCell>{ex.nombre_examen}</TableCell>
                                                                    <TableCell>{ex.resultado || 'Pendiente'}</TableCell>
                                                                    <TableCell align="right">{formatCurrency(ex.costo)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                            <TableRow>
                                                                <TableCell colSpan={2}><strong>Subtotal Exámenes:</strong></TableCell>
                                                                <TableCell align="right">
                                                                    <strong>{formatCurrency(visita.total_examenes)}</strong>
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}

                                        {/* Medicamentos */}
                                        {visita.medicamentos.length > 0 && (
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    Medicamentos Entregados:
                                                </Typography>
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Medicamento</TableCell>
                                                                <TableCell align="center">Cantidad</TableCell>
                                                                <TableCell align="right">Costo Unitario</TableCell>
                                                                <TableCell align="right">Subtotal</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {visita.medicamentos.map((med, idx) => (
                                                                <TableRow key={idx}>
                                                                    <TableCell>{med.nombre_medicamento}</TableCell>
                                                                    <TableCell align="center">{med.cantidad}</TableCell>
                                                                    <TableCell align="right">{formatCurrency(med.costo)}</TableCell>
                                                                    <TableCell align="right">
                                                                        {formatCurrency(med.costo * med.cantidad)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                            <TableRow>
                                                                <TableCell colSpan={3}><strong>Subtotal Medicamentos:</strong></TableCell>
                                                                <TableCell align="right">
                                                                    <strong>{formatCurrency(visita.total_medicamentos)}</strong>
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}

                                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                Total de esta visita: {formatCurrency(visita.total_visita)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}
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

export default ReporteCostosVisitas;