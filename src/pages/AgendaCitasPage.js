import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, Button,
    FormControl, InputLabel, Select, MenuItem, Divider, List, ListItem, ListItemText,
    ToggleButtonGroup, ToggleButton, Autocomplete, Popper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../utils/api';
import { jwtDecode as jwt_decode } from 'jwt-decode';

const AgendaCitasPage = () => {
    const [citas, setCitas] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentCita, setCurrentCita] = useState(null);
    const [updateData, setUpdateData] = useState({
        estado: '',
        diagnostico: '',
        observaciones_medicas: '',
        proxima_cita: ''
    });

    // Estados para Exámenes
    const [allExamenes, setAllExamenes] = useState([]);
    const [assignedExamenes, setAssignedExamenes] = useState([]);
    const [selectedExamenId, setSelectedExamenId] = useState('');

    // Estados para Medicamentos
    const [allMedicamentos, setAllMedicamentos] = useState([]);
    const [assignedMedicamentos, setAssignedMedicamentos] = useState([]);
    const [newMedicamentoData, setNewMedicamentoData] = useState({
        id_medicamento: '',
        cantidad: '',
        tiempo_aplicacion: ''
    });

    const [userRole, setUserRole] = useState(null);
    const [solicitudData, setSolicitudData] = useState(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    // Estados para Historial
    const [historialModalOpen, setHistorialModalOpen] = useState(false);
    const [historialData, setHistorialData] = useState(null);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    // Estado para Filtros
    const [filtroEstado, setFiltroEstado] = useState('programada');

    useEffect(() => {
        const fetchCitas = async (role, filtro) => {
            if (!role) return;
            try {
                let apiUrl = '';
                if (role === 'Medico Especialista' || role === 'Medico General') {
                    apiUrl = `/visitas/mis-citas?estado=${filtro}`;
                } else if (role === 'Fundación' || role === 'Administración') {
                    apiUrl = `/visitas?estado=${filtro}`; // Asumiendo que la ruta general también puede filtrar
                }

                if (apiUrl) {
                    const res = await api.get(apiUrl);
                    setCitas(res.data);
                }
            } catch (err) {
                console.error("Error al obtener las citas:", err);
            }
        };

        const loadInitialData = () => {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = jwt_decode(token);
                const role = decoded.user.nombre_rol;
                setUserRole(role);
                fetchCitas(role, filtroEstado);
            }
        };

        loadInitialData();
    }, [filtroEstado]);

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const [examenesRes, medicamentosRes] = await Promise.all([
                    api.get('/examenes'),
                    api.get('/medicamentos')
                ]);
                setAllExamenes(examenesRes.data);
                setAllMedicamentos(medicamentosRes.data);
            } catch (err) {
                console.error("Error al obtener catálogos:", err);
            }
        };
        fetchCatalogs();
    }, []);

    const handleOpenModal = async (cita, viewOnly = false) => {
        setIsReadOnly(viewOnly);
        setCurrentCita(cita);
        setUpdateData({
            estado: cita.estado || 'programada',
            diagnostico: cita.diagnostico || '',
            observaciones_medicas: cita.observaciones_medicas || '',
            proxima_cita: cita.proxima_cita ? new Date(cita.proxima_cita).toISOString().slice(0, 16) : ''
        });

        try {
            const [examenesRes, medicamentosRes, solicitudRes] = await Promise.all([
                api.get(`/visitas/${cita.id_visita}/examenes`),
                api.get(`/visitas/${cita.id_visita}/medicamentos`),
                api.get(`/solicitudes/${cita.id_solicitud}`)
            ]);
            setAssignedExamenes(examenesRes.data);
            setAssignedMedicamentos(medicamentosRes.data);
            setSolicitudData(solicitudRes.data);
        } catch (err) {
            console.error("Error al cargar datos de la visita:", err);
            setAssignedExamenes([]);
            setAssignedMedicamentos([]);
            setSolicitudData(null);
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => setModalOpen(false);
    const handleChange = (e) => setUpdateData({ ...updateData, [e.target.name]: e.target.value });

    const handleAddExamen = async () => {
        if (!selectedExamenId || !currentCita) return;
        try {
            await api.post(`/visitas/${currentCita.id_visita}/examenes`, { id_examen: selectedExamenId });
            const res = await api.get(`/visitas/${currentCita.id_visita}/examenes`);
            setAssignedExamenes(res.data);
            setSelectedExamenId('');
        } catch (err) { console.error("Error al añadir examen:", err); }
    };

    const handleRemoveExamen = async (id_examen) => {
        if (!currentCita) return;
        try {
            await api.delete(`/visitas/${currentCita.id_visita}/examenes/${id_examen}`);
            setAssignedExamenes(assignedExamenes.filter(ex => ex.id_examen !== id_examen));
        } catch (err) { console.error("Error al quitar examen:", err); }
    };

    const handleMedicamentoChange = (e) => setNewMedicamentoData({ ...newMedicamentoData, [e.target.name]: e.target.value });

    const handleAddMedicamento = async () => {
        if (!newMedicamentoData.id_medicamento || !newMedicamentoData.cantidad || !newMedicamentoData.tiempo_aplicacion) return;
        try {
            await api.post(`/visitas/${currentCita.id_visita}/medicamentos`, newMedicamentoData);
            const res = await api.get(`/visitas/${currentCita.id_visita}/medicamentos`);
            setAssignedMedicamentos(res.data);
            setNewMedicamentoData({ id_medicamento: '', cantidad: '', tiempo_aplicacion: '' });
        } catch (err) { console.error("Error al añadir medicamento:", err); }
    };

    const handleRemoveMedicamento = async (id_medicamento) => {
        if (!currentCita) return;
        try {
            await api.delete(`/visitas/${currentCita.id_visita}/medicamentos/${id_medicamento}`);
            setAssignedMedicamentos(assignedMedicamentos.filter(med => med.id_medicamento !== id_medicamento));
        } catch (err) { console.error("Error al quitar medicamento:", err); }
    };

    const handleSubmit = async () => {
        try {
            await api.put(`/visitas/${currentCita.id_visita}`, updateData);
            handleCloseModal();

            // Forzar la recarga de datos con el filtro actual
            const decoded = jwt_decode(localStorage.getItem('token'));
            const role = decoded.user.nombre_rol;
            let refreshUrl = '';
            if (role === 'Medico Especialista' || role === 'Medico General') {
                refreshUrl = `/visitas/mis-citas?estado=${filtroEstado}`;
            } else if (role === 'Fundación' || role === 'Administración') {
                refreshUrl = `/visitas?estado=${filtroEstado}`;
            }
            if (refreshUrl) {
                const res = await api.get(refreshUrl);
                setCitas(res.data);
            }
            alert('¡Cita actualizada exitosamente!');
        } catch (error) {
            console.error("Error al actualizar la cita:", error);
            alert('No se pudo actualizar la cita.');
        }
    };

    const getStatusChip = (status) => {
        let color = 'default';
        if (status === 'programada') color = 'primary';
        if (status === 'realizada') color = 'warning';
        if (status === 'completada') color = 'success';
        if (status === 'cancelada') color = 'error';
        return <Chip label={status} color={color} size="small" />;
    };

    const handleFiltroChange = (event, nuevoFiltro) => {
        if (nuevoFiltro !== null) {
            setFiltroEstado(nuevoFiltro);
        }
    };

    const handleOpenHistorialModal = async (id_paciente) => {
        if (!id_paciente) return;
        setLoadingHistorial(true);
        setHistorialModalOpen(true);
        try {
            const res = await api.get(`/pacientes/${id_paciente}/historial`);
            setHistorialData(res.data);
        } catch (err) {
            console.error("Error al obtener el historial:", err);
            setHistorialData([]);
        } finally {
            setLoadingHistorial(false);
        }
    };

    const handleCloseHistorialModal = () => {
        setHistorialModalOpen(false);
        setHistorialData(null);
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>Agenda de Citas</Typography>

            <Box sx={{ mb: 2 }}>
                <ToggleButtonGroup color="primary" value={filtroEstado} exclusive onChange={handleFiltroChange} aria-label="filtro de estado">
                    <ToggleButton value="programada">Programadas</ToggleButton>
                    <ToggleButton value="realizada">Pendientes de Resultados</ToggleButton>
                    <ToggleButton value="resultados_listos">Para Revisión</ToggleButton>
                    <ToggleButton value="completada">Completadas</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha y Hora</TableCell>
                            <TableCell>Paciente</TableCell>
                            <TableCell>Especialista</TableCell>
                            <TableCell>Enfermero/a</TableCell>
                            <TableCell>Lugar</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {citas.map((cita) => (
                            <TableRow key={cita.id_visita}>
                                <TableCell>{new Date(cita.fecha_visita).toLocaleString('es-GT')}</TableCell>
                                <TableCell>{cita.nombre_paciente}</TableCell>
                                <TableCell>{cita.nombre_medico_especialista || 'N/A'}</TableCell>
                                <TableCell>{cita.nombre_enfermero || 'N/A'}</TableCell>
                                <TableCell>{cita.lugar}</TableCell>
                                <TableCell>{getStatusChip(cita.estado)}</TableCell>
                                <TableCell align="right">
                                    {userRole && (userRole === 'Administración' || userRole === 'Medico Especialista') && (
                                        <>
                                            {cita.estado === 'completada' || cita.estado === 'cancelada' ? (
                                                <IconButton color="default" onClick={() => handleOpenModal(cita, true)}><VisibilityIcon /></IconButton>
                                            ) : (
                                                <IconButton color="primary" onClick={() => handleOpenModal(cita, false)}><EditIcon /></IconButton>
                                            )}
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="lg" fullWidth>
                <DialogTitle>Actualizar Cita y Registrar Resultados</DialogTitle>
                <DialogContent>
                    {solicitudData && (
                        <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'grey.100' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6">Paciente: <strong>{solicitudData.nombre_paciente}</strong></Typography>
                                <Button variant="outlined" size="small" onClick={() => handleOpenHistorialModal(solicitudData.id_paciente)} disabled={!solicitudData || !solicitudData.id_paciente}>
                                    Ver Historial Completo
                                </Button>
                            </Box>
                            <TextField label="Motivo de la Visita (Referido por Médico General)" fullWidth multiline value={solicitudData.motivo || 'No especificado'} InputProps={{ readOnly: true }} variant="outlined" />
                        </Paper>
                    )}
                    <Grid container spacing={4} sx={{ mt: 0.1 }}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, mb: 2 }}>
                                <Typography variant="h6" gutterBottom>Datos Generales de la Cita</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth><InputLabel>Estado de la Cita</InputLabel>
                                            <Select name="estado" label="Estado de la Cita" value={updateData.estado} onChange={handleChange} disabled={isReadOnly}>
                                                <MenuItem value="programada">Programada</MenuItem>
                                                <MenuItem value="realizada">Realizada (Pendiente de Resultados)</MenuItem>
                                                <MenuItem value="completada">Completada (Caso Cerrado)</MenuItem>
                                                <MenuItem value="cancelada">Cancelada</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField name="proxima_cita" label="Próxima Cita" type="datetime-local" fullWidth value={updateData.proxima_cita} onChange={handleChange} InputLabelProps={{ shrink: true }} disabled={isReadOnly} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField name="diagnostico" label="Diagnóstico Médico" fullWidth multiline rows={3} value={updateData.diagnostico} onChange={handleChange} disabled={isReadOnly} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            name="observaciones_medicas"
                                            label="Observaciones y Plan de Tratamiento"
                                            fullWidth
                                            multiline
                                            rows={4}
                                            value={updateData.observaciones_medicas}
                                            onChange={handleChange}
                                            disabled={isReadOnly}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>Gestión de los Exámenes</Typography>
                                <List dense sx={{ mb: 2 }}>
                                    {assignedExamenes.map(ex => (
                                        <ListItem key={ex.id_examen} secondaryAction={<IconButton edge="end" size="small" color="error" onClick={() => handleRemoveExamen(ex.id_examen)} disabled={isReadOnly}> <DeleteIcon fontSize="small" /> </IconButton>}><ListItemText primary={ex.nombre_examen} secondary={ex.resultado ? `Resultado: ${ex.resultado}` : 'Pendiente'} /></ListItem>
                                    ))}
                                </List>
                                <Autocomplete
                                    options={allExamenes}
                                    getOptionLabel={(option) => option.nombre_examen || ''}
                                    value={allExamenes.find(ex => ex.id_examen === selectedExamenId) || null}
                                    onChange={(event, newValue) => {
                                        setSelectedExamenId(newValue ? newValue.id_examen : '');
                                    }}
                                    PopperComponent={(props) => <Popper {...props} style={{ zIndex: 1400 }} />}
                                    renderInput={(params) => <TextField {...params} label="Buscar Examen" placeholder="Ej: Hemograma, Glucosa..." />}
                                    disabled={isReadOnly}
                                    sx={{ mb: 2 }}
                                />
                                <Button variant="contained" startIcon={<AddCircleIcon />} onClick={handleAddExamen} fullWidth disabled={!selectedExamenId || isReadOnly}>Añadir Examen</Button>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, height: '100%' }}>
                                <Typography variant="h6" gutterBottom>Prescripción de Medicamentos</Typography>
                                <List dense sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
                                    {assignedMedicamentos.map(med => (
                                        <ListItem key={med.id_medicamento} secondaryAction={<IconButton edge="end" size="small" color="error" onClick={() => handleRemoveMedicamento(med.id_medicamento)} disabled={isReadOnly}> <DeleteIcon fontSize="small" /> </IconButton>}><ListItemText primary={med.nombre} secondary={`Cant: ${med.cantidad} - Indicaciones: ${med.tiempo_aplicacion}`} /></ListItem>
                                    ))}
                                </List>
                                <Divider sx={{ my: 2 }}><Chip label="Añadir a la Receta" /></Divider>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            options={allMedicamentos}
                                            getOptionLabel={(option) => option.nombre || ''}
                                            value={allMedicamentos.find(m => m.id_medicamento === newMedicamentoData.id_medicamento) || null}
                                            onChange={(event, newValue) => {
                                                handleMedicamentoChange({
                                                    target: {
                                                        name: 'id_medicamento',
                                                        value: newValue ? newValue.id_medicamento : ''
                                                    }
                                                });
                                            }}
                                            PopperComponent={(props) => <Popper {...props} style={{ zIndex: 1400 }} />}
                                            renderInput={(params) => <TextField {...params} label="Buscar Medicamento" />}
                                            disabled={isReadOnly}
                                        />

                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField name="cantidad" label="Cantidad Unitaria" type="number" fullWidth value={newMedicamentoData.cantidad} onChange={handleMedicamentoChange} disabled={isReadOnly} />
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <TextField name="tiempo_aplicacion" label="Indicaciones (ej. 1 cada 8h)" fullWidth value={newMedicamentoData.tiempo_aplicacion} onChange={handleMedicamentoChange} disabled={isReadOnly} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button variant="contained" startIcon={<AddCircleIcon />} onClick={handleAddMedicamento} fullWidth disabled={!newMedicamentoData.id_medicamento || isReadOnly}>Añadir a la Receta</Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cerrar</Button>
                    {!isReadOnly && (<Button onClick={handleSubmit} variant="contained">Guardar Cambios</Button>)}
                </DialogActions>
            </Dialog>

            <HistorialPacienteModal
                open={historialModalOpen}
                onClose={handleCloseHistorialModal}
                historial={historialData}
                loading={loadingHistorial}
                nombrePaciente={solicitudData?.nombre_paciente || ''}
            />
        </Box>
    );
};

const HistorialPacienteModal = ({ open, onClose, historial, loading, nombrePaciente }) => {
    // La variable 'historial' ahora contiene { visitas: [], condiciones: [] }
    const visitas = historial?.visitas || [];
    const condiciones = historial?.condiciones || [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Historial Médico de: <strong>{nombrePaciente}</strong></DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                ) : (
                    <Grid container spacing={3}>
                        {/* Columna para Condiciones de Base */}
                        <Grid item xs={12} md={5}>
                            <Typography variant="h6" gutterBottom>Condiciones de Base</Typography>
                            {condiciones.length > 0 ? condiciones.map(cond => (
                                <Paper key={cond.id_condicion} sx={{ p: 2, mb: 1 }} variant="outlined">
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{cond.nombre_condicion}</Typography>
                                    <Typography variant="body2" color="text.secondary">Diagnosticado: {new Date(cond.fecha_diagnostico).toLocaleDateString('es-GT')}</Typography>
                                    {cond.tratamientos && cond.tratamientos.length > 0 && (
                                        <>
                                            <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold' }}>Tratamientos Fijos:</Typography>
                                            <List dense disablePadding>
                                                {cond.tratamientos.map(t => (
                                                    <ListItemText key={t.id_tratamiento} sx={{ pl: 1 }} primary={`• ${t.nombre_medicamento}`} secondary={`${t.dosis} - ${t.frecuencia}`} />
                                                ))}
                                            </List>
                                        </>
                                    )}
                                </Paper>
                            )) : <Typography variant="body2" sx={{ fontStyle: 'italic' }}>No hay condiciones de base.</Typography>}
                        </Grid>

                        {/* Columna para Historial de Visitas */}
                        <Grid item xs={12} md={7}>
                            <Typography variant="h6" gutterBottom>Historial de Visitas</Typography>
                            {visitas.length > 0 ? visitas.map(visita => (
                                <Paper key={visita.id_visita} sx={{ p: 2, mb: 1 }} variant="outlined">
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Fecha: {new Date(visita.fecha_visita).toLocaleDateString('es-GT')}</Typography>
                                    <Typography><strong>Diagnóstico:</strong> {visita.diagnostico || 'No especificado'}</Typography>
                                    <Typography variant="body2" color="text.secondary">Atendido por: Dr./Dra. {visita.nombre_medico || 'N/A'}</Typography>
                                    {/* Aquí podrías añadir examenes y medicamentos de la visita si los necesitas */}
                                </Paper>
                            )) : <Typography variant="body2" sx={{ fontStyle: 'italic' }}>No hay visitas anteriores.</Typography>}
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
};
export default AgendaCitasPage;