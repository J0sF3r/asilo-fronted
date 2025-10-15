import React, { useState } from 'react';
import {
    Typography, Box, Paper, Grid, Card, CardContent, CardActionArea,
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Divider
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';

// Importaremos los componentes de reportes individuales
import ReporteCobros from '../components/reportes/ReporteCobros';
import ReportePagosFundacion from '../components/reportes/ReportePagosFundacion';
import ReporteEntradas from '../components/reportes/ReporteEntradas';
import ReporteExamenes from '../components/reportes/ReporteExamenes';
import ReporteMedicamentos from '../components/reportes/ReporteMedicamentos';

const ReportesPage = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
    
    const reportes = [
        {
            id: 'cobros',
            titulo: 'Cobros por Familiar/Paciente',
            descripcion: 'Detalle de cargos, descuentos y pagos por familiar en un rango de fechas',
            icono: <AssessmentIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
            component: ReporteCobros
        },
        {
            id: 'pagos-fundacion',
            titulo: 'Pagos a la Fundación',
            descripcion: 'Resumen de todos los pagos realizados a la fundación por servicios médicos',
            icono: <AssessmentIcon sx={{ fontSize: 60, color: 'success.main' }} />,
            component: ReportePagosFundacion
        },
        {
            id: 'entradas',
            titulo: 'Entradas (Donaciones y Cobros)',
            descripcion: 'Reporte consolidado de ingresos por donaciones y cobros de cuotas',
            icono: <AssessmentIcon sx={{ fontSize: 60, color: 'info.main' }} />,
            component: ReporteEntradas
        },
        {
            id: 'examenes',
            titulo: 'Exámenes Médicos por Paciente',
            descripcion: 'Historial de exámenes realizados con resultados por paciente',
            icono: <AssessmentIcon sx={{ fontSize: 60, color: 'warning.main' }} />,
            component: ReporteExamenes
        },
        {
            id: 'medicamentos',
            titulo: 'Medicamentos Aplicados por Paciente',
            descripcion: 'Registro de todos los medicamentos dispensados por paciente',
            icono: <AssessmentIcon sx={{ fontSize: 60, color: 'error.main' }} />,
            component: ReporteMedicamentos
        }
    ];

    const handleOpenReporte = (reporte) => {
        setReporteSeleccionado(reporte);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setReporteSeleccionado(null);
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Centro de Reportes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Genera, visualiza y exporta reportes detallados del sistema
            </Typography>

            <Grid container spacing={3}>
                {reportes.map((reporte) => (
                    <Grid item xs={12} sm={6} md={4} key={reporte.id}>
                        <Card elevation={3} sx={{ height: '100%' }}>
                            <CardActionArea onClick={() => handleOpenReporte(reporte)} sx={{ height: '100%' }}>
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    {reporte.icono}
                                    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                                        {reporte.titulo}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {reporte.descripcion}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Modal para generar reporte */}
            <Dialog 
                open={modalOpen} 
                onClose={handleCloseModal} 
                maxWidth="lg" 
                fullWidth
                PaperProps={{ sx: { minHeight: '80vh' } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{reporteSeleccionado?.titulo}</Typography>
                    <IconButton onClick={handleCloseModal}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Divider />
                <DialogContent>
                    {reporteSeleccionado && React.createElement(reporteSeleccionado.component)}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default ReportesPage;