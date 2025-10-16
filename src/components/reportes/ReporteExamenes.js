import React, { useState, useEffect } from 'react';
import {
    Box, Button, FormControl, InputLabel, Select, MenuItem, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Grid, CircularProgress, Stack
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../utils/api';
import { generarPDFExamenes } from './utils/pdfGenerator';
import { generarExcelExamenes } from './utils/excelGenerator';

const ReporteExamenes = () => {
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
            const res = await api.get(`/reportes/examenes/${selectedPaciente}`, {
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
        generarPDFExamenes(datosReporte, fechaInicio, fechaFin);
    };

    const handleExportarExcel = () => {
        if (!datosReporte) return;
        generarExcelExamenes(datosReporte, fechaInicio, fechaFin);
    };

    const handleImprimir = () => {
        window.print();
    };

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
                            <Typography variant="h6">Reporte de Exámenes Médicos por Paciente</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Paciente: {datosReporte.paciente.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Período: {fechaInicio.split('-').reverse().join('/')} - {fechaFin.split('-').reverse().join('/')}
                            </Typography>
                        </Box>

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Fecha</strong></TableCell>
                                        <TableCell><strong>Examen</strong></TableCell>
                                        <TableCell><strong>Resultado</strong></TableCell>
                                        <TableCell><strong>Médico</strong></TableCell>
                                        <TableCell><strong>Diagnóstico</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {datosReporte.examenes.map((ex, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{new Date(ex.fecha_visita).toLocaleDateString('es-GT')}</TableCell>
                                            <TableCell>{ex.nombre_examen}</TableCell>
                                            <TableCell>{ex.resultado || 'Pendiente'}</TableCell>
                                            <TableCell>{ex.nombre_medico || 'N/A'}</TableCell>
                                            <TableCell>{ex.diagnostico || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="h6" gutterBottom><strong>Resumen</strong></Typography>
                            <Typography variant="body1">
                                Total de Exámenes Realizados: <strong>{datosReporte.totalExamenes}</strong>
                            </Typography>
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

export default ReporteExamenes;