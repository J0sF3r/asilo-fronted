import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Typography, Box, Paper, Grid, CircularProgress, List, ListItem, ListItemText, IconButton, Divider, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
    Chip, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../utils/api';

const PacienteDetailPage = () => {
    const { id } = useParams();
    const [paciente, setPaciente] = useState(null);
    const [familiares, setFamiliares] = useState([]);
    const [historial, setHistorial] = useState([]); // Renombrado de 'solicitudes' a 'historial'
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [availableFamiliares, setAvailableFamiliares] = useState([]);
    const [selectedFamiliarId, setSelectedFamiliarId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pacienteRes, familiaresRes, historialRes] = await Promise.all([
                api.get(`/pacientes/${id}`),
                api.get(`/pacientes/${id}/familiares`),
                api.get(`/pacientes/${id}/solicitudes`) // Esta ruta ahora trae toda la info
            ]);
            setPaciente(pacienteRes.data);
            setFamiliares(familiaresRes.data);
            setHistorial(historialRes.data);
        } catch (err) {
            console.error("Error al obtener los datos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleOpenModal = async () => {
        try {
            const res = await api.get('/familiares');
            const assignedIds = new Set(familiares.map(f => f.id_familiar));
            setAvailableFamiliares(res.data.filter(f => !assignedIds.has(f.id_familiar)));
            setModalOpen(true);
        } catch (err) {
            console.error("Error al cargar familiares disponibles:", err);
        }
    };
    
    const handleCloseModal = () => setModalOpen(false);
    
    const handleAssignSubmit = async () => {
        if (!selectedFamiliarId) return;
        try {
            await api.post(`/pacientes/${id}/familiares`, { id_familiar: selectedFamiliarId });
            fetchData(); // Refrescar todos los datos
            handleCloseModal();
        } catch (err) {
            console.error("Error al asignar familiar:", err);
        }
    };
    
    const handleUnlinkFamiliar = async (id_familiar) => {
        if (window.confirm('¿Estás seguro de que quieres desvincular a este familiar?')) {
            try {
                await api.delete(`/pacientes/${id}/familiares/${id_familiar}`);
                fetchData(); // Refrescar todos los datos
            } catch (err) {
                console.error("Error al desvincular familiar:", err);
            }
        }
    };

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('es-GT') : 'N/A';
    
    const getStatusChip = (status) => {
        let color = 'default';
        if (status === 'programada') color = 'primary';
        if (status === 'atendida') color = 'success';
        if (status === 'cancelada') color = 'error';
        return <Chip label={status} color={color} size="small" />;
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }
    if (!paciente) {
        return <Typography variant="h5" sx={{ p: 3 }}>Paciente no encontrado.</Typography>;
    }
    
    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Button component={RouterLink} to="/pacientes" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Volver a Pacientes
            </Button>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" gutterBottom>{paciente.nombre}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1"><strong>Fecha de Nacimiento:</strong> {formatDate(paciente.fecha_nacimiento)}</Typography>
                    </Grid>
                     <Grid item xs={12} sm={6}><Typography><strong>Sexo:</strong> {paciente.sexo}</Typography></Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1"><strong>Dirección:</strong> {paciente.direccion}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1"><strong>Teléfono:</strong> {paciente.telefono}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Historial Clínico
            </Typography>
            {historial.length > 0 ? (
                historial.map((solicitud) => (
                    <Accordion key={solicitud.id_solicitud} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap' }}>
                                <Typography sx={{ mr: 2 }}><strong>Motivo:</strong> {solicitud.motivo}</Typography>
                                <Box>
                                    <Chip label={`Solicitud: ${formatDate(solicitud.fecha_solicitud)}`} size="small" sx={{ mr: 1 }} />
                                    {getStatusChip(solicitud.estado)}
                                </Box>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ backgroundColor: '#f7f7f7' }}>
                            <Typography variant="subtitle2" gutterBottom>Detalles de la Solicitud</Typography>
                            <Typography variant="body2"><strong>Médico General:</strong> {solicitud.nombre_medico_general}</Typography>
                            <Typography variant="body2"><strong>Especialista Asignado:</strong> {solicitud.nombre_medico_especialista || 'No asignado'}</Typography>
                            
                            {solicitud.visita ? (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" gutterBottom>Detalles de la Visita Médica</Typography>
                                    <Typography variant="body2"><strong>Fecha de Visita:</strong> {formatDate(solicitud.visita.fecha_visita)}</Typography>
                                    <Typography variant="body2"><strong>Lugar:</strong> {solicitud.visita.lugar}</Typography>
                                    <Typography variant="body2"><strong>Diagnóstico:</strong> {solicitud.visita.diagnostico || 'Pendiente'}</Typography>
                                    <Typography variant="body2"><strong>Tratamiento:</strong> {solicitud.visita.tratamiento_recetado || 'Pendiente'}</Typography>

                                    {solicitud.visita.examenes && solicitud.visita.examenes.length > 0 && (
                                        <>
                                            <Typography variant="body2" sx={{ mt: 1 }}><strong>Exámenes Solicitados:</strong></Typography>
                                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                {solicitud.visita.examenes.map(ex => (
                                                    <li key={ex.nombre_examen}>
                                                        {ex.nombre_examen} - <strong>Resultado:</strong> {ex.resultado || 'Pendiente'}
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </>
                            ) : (
                                <Typography variant="body2" sx={{mt: 2, fontStyle: 'italic'}}>No se ha registrado una visita para esta solicitud.</Typography>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))
            ) : (
                <Typography>No hay historial de solicitudes para este paciente.</Typography>
            )}

            <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                        Familiares Asignados
                    </Typography>
                    <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenModal}>
                        Asignar Familiar
                    </Button>
                </Box>
                <Paper sx={{ p: 2 }}>
                    <List>
                        {familiares.length > 0 ? (
                            familiares.map((familiar, index) => (
                                <React.Fragment key={familiar.id_familiar}>
                                    <ListItem
                                        secondaryAction={
                                            <IconButton edge="end" color="error" onClick={() => handleUnlinkFamiliar(familiar.id_familiar)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText
                                            primary={familiar.nombre}
                                            secondary={
                                            <React.Fragment>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {`Parentesco: ${familiar.parentesco}     - Tel: ${familiar.telefono}`}
                                                </Typography>
                                                <Typography component="span" variant="body2" display="block" color="text.secondary">
                                                    {`Email: ${familiar.email || 'No tiene'}`}
                                                </Typography>
                                            </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                    {index < familiares.length - 1 && <Divider />}
                                </React.Fragment>
                            ))
                        ) : (
                            <ListItem><ListItemText primary="Este paciente no tiene familiares asignados." /></ListItem>
                        )}
                    </List>
                </Paper>
            </Box>

            <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="xs">
                <DialogTitle>Asignar un Familiar Existente</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Seleccionar Familiar</InputLabel>
                        <Select
                            value={selectedFamiliarId}
                            label="Seleccionar Familiar"
                            onChange={(e) => setSelectedFamiliarId(e.target.value)}
                        >
                            {availableFamiliares.map(f => (
                                <MenuItem key={f.id_familiar} value={f.id_familiar}>{f.nombre}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancelar</Button>
                    <Button onClick={handleAssignSubmit} variant="contained">Asignar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PacienteDetailPage;