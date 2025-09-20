import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, Divider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info'; // Importar el nuevo icono
import api from '../utils/api';

const LaboratorioPage = () => {
    const [pendientes, setPendientes] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false); // Nuevo estado para el modal de detalles
    const [currentExamen, setCurrentExamen] = useState(null);
    const [resultadoData, setResultadoData] = useState({
        resultado: '',
        fecha_realizacion: ''
    });
     // FUNCIÓN PARA OBTENER LA FECHA LOCAL ---
     const getLocalDateTime = () => {
        const date = new Date();
         date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    };
    const fetchPendientes = async () => {
        try {
            const res = await api.get('/laboratorio/pendientes');
            setPendientes(res.data);
        } catch (err) {
            console.error("Error al obtener los exámenes pendientes:", err);
        }
    };

    useEffect(() => {
        fetchPendientes();
    }, []);

    const handleOpenModal = (examen) => {
        setCurrentExamen(examen);
        setResultadoData({ resultado: '', fecha_realizacion: getLocalDateTime() });
        setModalOpen(true);
    };

    const handleCloseModal = () => setModalOpen(false);

    // Nuevas funciones para el modal de detalles
    const handleOpenDetailsModal = (examen) => {
        setCurrentExamen(examen);
        setDetailsModalOpen(true);
    };
    const handleCloseDetailsModal = () => setDetailsModalOpen(false);

    const handleChange = (e) => {
        setResultadoData({ ...resultadoData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!resultadoData.resultado || !resultadoData.fecha_realizacion) {
            return alert('Por favor, complete todos los campos.');
        }
        try {
            const body = {
                id_visita: currentExamen.id_visita,
                id_examen: currentExamen.id_examen,
                resultado: resultadoData.resultado,
                fecha_realizacion: resultadoData.fecha_realizacion
            };
            await api.put('/laboratorio/resultado', body);
            handleCloseModal();
            fetchPendientes();
            alert('Resultado registrado exitosamente.');
        } catch (err) {
            console.error("Error al registrar el resultado:", err);
            alert('No se pudo registrar el resultado.');
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-GT');

    return (
        <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <Paper sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
                    Portal de Laboratorio - Exámenes Pendientes
                </Typography>
                
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha de Solicitud</TableCell>
                                <TableCell>Paciente</TableCell>
                                <TableCell>Nombre del Examen</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendientes.length > 0 ? pendientes.map((examen) => (
                                <TableRow key={`${examen.id_visita}-${examen.id_examen}`}>
                                    <TableCell>{formatDate(examen.fecha_solicitud)}</TableCell>
                                    <TableCell>{examen.nombre_paciente}</TableCell>
                                    <TableCell>{examen.nombre_examen}</TableCell>
                                    <TableCell align="right">
                                        {/* BOTÓN DE DETALLES AÑADIDO */}
                                        <IconButton color="default" onClick={() => handleOpenDetailsModal(examen)} sx={{ mr: 1 }}>
                                            <InfoIcon />
                                        </IconButton>
                                        <Button variant="contained" size="small" onClick={() => handleOpenModal(examen)}>
                                            Registrar Resultado
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No hay exámenes pendientes.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Modal para registrar resultado (sin cambios) */}
            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>Registrar Resultado de Examen</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="subtitle1"><strong>Paciente:</strong> {currentExamen?.nombre_paciente}</Typography>
                        <Typography variant="subtitle1" gutterBottom><strong>Examen:</strong> {currentExamen?.nombre_examen}</Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField name="resultado" label="Resultado del Examen" fullWidth multiline rows={4} required value={resultadoData.resultado} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField name="fecha_realizacion" label="Fecha de Realización" type="datetime-local" fullWidth required value={resultadoData.fecha_realizacion} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar Resultado</Button>
                </DialogActions>
            </Dialog>

            {/* NUEVO MODAL PARA VER DETALLES DE LA VISITA */}
            <Dialog open={detailsModalOpen} onClose={handleCloseDetailsModal} maxWidth="sm" fullWidth>
                <DialogTitle>Detalles de la Visita Médica</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Typography variant="body1" gutterBottom><strong>Paciente:</strong> {currentExamen?.nombre_paciente}</Typography>
                        <Typography variant="body1" gutterBottom><strong>Examen Solicitado:</strong> {currentExamen?.nombre_examen}</Typography>
                        <Typography variant="body1" gutterBottom><strong>Médico Solicitante:</strong> {currentExamen?.medico_solicitante || 'N/A'}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" gutterBottom><strong>Contexto Clínico</strong></Typography>
                        <Typography variant="body2" gutterBottom><strong>Diagnóstico Preliminar:</strong> {currentExamen?.diagnostico_preliminar || 'No especificado'}</Typography>
                        <Typography variant="body2" gutterBottom><strong>Observaciones del Médico:</strong> {currentExamen?.observaciones_medicas || 'Sin observaciones'}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailsModal}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LaboratorioPage;