import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Typography, Box, Paper, Grid, List, ListItem, ListItemText, IconButton, Divider, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
    Chip, Accordion, AccordionSummary, AccordionDetails, CircularProgress, TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';


const PacienteDetailPage = () => {
    const { id } = useParams();
    const [paciente, setPaciente] = useState(null);
    const [familiares, setFamiliares] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    const [userRole, setUserRole] = useState(null);

    // Estados para Condiciones y Tratamientos
    const [condiciones, setCondiciones] = useState([]);
    const [condicionModal, setCondicionModal] = useState({ open: false, data: null });
    const [tratamientoModal, setTratamientoModal] = useState({ open: false, data: null, id_condicion: null });
    
    // NUEVO: Estados para medicamentos
    const [medicamentos, setMedicamentos] = useState([]);
    const [tratamientoFormData, setTratamientoFormData] = useState({
        id_medicamento: '',
        nombre_medicamento: '',
        dosis: '',
        frecuencia: '',
        intervalo_dias: 28
    });

    // Estados para el modal de familiares
    const [familiarModalOpen, setFamiliarModalOpen] = useState(false);
    const [availableFamiliares, setAvailableFamiliares] = useState([]);
    const [selectedFamiliarId, setSelectedFamiliarId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pacienteRes, familiaresRes, historialRes, condicionesRes, medicamentosRes] = await Promise.all([
                api.get(`/pacientes/${id}`),
                api.get(`/pacientes/${id}/familiares`),
                api.get(`/pacientes/${id}/solicitudes`),
                api.get(`/pacientes/${id}/condiciones`),
                api.get('/medicamentos') // NUEVO: Cargar medicamentos
            ]);
            setPaciente(pacienteRes.data);
            setFamiliares(familiaresRes.data);
            setHistorial(historialRes.data);
            setCondiciones(condicionesRes.data);
            setMedicamentos(medicamentosRes.data);
        } catch (err) {
            console.error("Error al obtener los datos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setUserRole(decoded.user.nombre_rol);
        }

        fetchData();
    }, [id]);


    // --- Funciones para CRUD de Familiares ---
    const handleOpenFamiliarModal = async () => {
        try {
            const res = await api.get(`/familiares/disponibles/${id}`);
            const assignedIds = new Set(familiares.map(f => f.id_familiar));
            setAvailableFamiliares(res.data.filter(f => !assignedIds.has(f.id_familiar)));
            setFamiliarModalOpen(true);
        } catch (err) {
            console.error("Error al cargar familiares disponibles:", err);
        }
    };
    const handleCloseFamiliarModal = () => setFamiliarModalOpen(false);
    const handleAssignFamiliarSubmit = async () => {
        if (!selectedFamiliarId) return;
        try {
            await api.post(`/pacientes/${id}/familiares`, { id_familiar: selectedFamiliarId });
            fetchData();
            handleCloseFamiliarModal();
        } catch (err) {
            console.error("Error al asignar familiar:", err);
        }
    };
    const handleUnlinkFamiliar = async (id_familiar) => {
        if (window.confirm('¿Estás seguro de que quieres desvincular a este familiar?')) {
            try {
                await api.delete(`/pacientes/${id}/familiares/${id_familiar}`);
                fetchData();
            } catch (err) {
                console.error("Error al desvincular familiar:", err);
            }
        }
    };

    // --- Funciones para CRUD de Condiciones ---
    const handleOpenCondicionModal = (data = null) => setCondicionModal({ open: true, data });
    const handleCloseCondicionModal = () => setCondicionModal({ open: false, data: null });
    const handleCondicionSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());
        try {
            if (condicionModal.data) {
                await api.put(`/condiciones/${condicionModal.data.id_condicion}`, data);
            } else {
                await api.post(`/pacientes/${id}/condiciones`, data);
            }
            fetchData();
            handleCloseCondicionModal();
        } catch (err) {
            console.error("Error al guardar la condición:", err);
        }
    };
    const handleDeleteCondicion = async (id_condicion) => {
        if (window.confirm('¿Seguro que quieres eliminar esta condición y todos sus tratamientos fijos asociados?')) {
            try {
                await api.delete(`/condiciones/${id_condicion}`);
                fetchData();
            } catch (err) {
                console.error("Error al eliminar la condición:", err);
            }
        }
    };

    // --- Funciones ACTUALIZADAS para CRUD de Tratamientos Fijos ---
    const handleOpenTratamientoModal = (id_condicion, data = null) => {
        if (data) {
            // Editando tratamiento existente
            setTratamientoFormData({
                id_medicamento: data.id_medicamento || '',
                nombre_medicamento: data.nombre_medicamento || '',
                dosis: data.dosis || '',
                frecuencia: data.frecuencia || '',
                intervalo_dias: data.intervalo_dias || 28
            });
        } else {
            // Nuevo tratamiento
            setTratamientoFormData({
                id_medicamento: '',
                nombre_medicamento: '',
                dosis: '',
                frecuencia: '',
                intervalo_dias: 28
            });
        }
        setTratamientoModal({ open: true, data, id_condicion });
    };
    
    const handleCloseTratamientoModal = () => {
        setTratamientoModal({ open: false, data: null, id_condicion: null });
        setTratamientoFormData({
            id_medicamento: '',
            nombre_medicamento: '',
            dosis: '',
            frecuencia: '',
            intervalo_dias: 28
        });
    };
    
    const handleTratamientoChange = (e) => {
        const { name, value } = e.target;
        
        setTratamientoFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Si cambió el medicamento, auto-llenar el nombre
            if (name === 'id_medicamento' && value) {
                const medicamento = medicamentos.find(m => m.id_medicamento === parseInt(value));
                if (medicamento) {
                    newData.nombre_medicamento = medicamento.nombre;
                }
            }
            
            return newData;
        });
    };
    
    const handleTratamientoSubmit = async (event) => {
        event.preventDefault();
        
        if (!tratamientoFormData.nombre_medicamento) {
            alert('Debes seleccionar un medicamento o ingresar un nombre.');
            return;
        }
        
        try {
            const dataToSend = {
                id_medicamento: tratamientoFormData.id_medicamento || null,
                nombre_medicamento: tratamientoFormData.nombre_medicamento,
                dosis: tratamientoFormData.dosis,
                frecuencia: tratamientoFormData.frecuencia,
                intervalo_dias: tratamientoFormData.intervalo_dias
            };
            
            if (tratamientoModal.data) {
                await api.put(`/tratamientos/${tratamientoModal.data.id_tratamiento}`, dataToSend);
                alert('Tratamiento actualizado exitosamente.');
            } else {
                await api.post(`/tratamientos/condicion/${tratamientoModal.id_condicion}`, dataToSend);
                alert('Tratamiento agregado exitosamente.');
            }
            fetchData();
            handleCloseTratamientoModal();
        } catch (err) {
            console.error("Error al guardar el tratamiento:", err);
            alert('No se pudo guardar el tratamiento.');
        }
    };
    
    const handleDeleteTratamiento = async (id_tratamiento) => {
        if (window.confirm('¿Seguro que quieres eliminar este tratamiento fijo?')) {
            try {
                await api.delete(`/tratamientos/${id_tratamiento}`);
                fetchData();
            } catch (err) {
                console.error("Error al eliminar el tratamiento:", err);
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

    const handleSetPrincipal = async (id_familiar) => {
        if (window.confirm('¿Estás seguro de que quieres designar a este familiar como el contacto principal?')) {
            try {
                await api.put(`/pacientes/${id}/familiares/${id_familiar}/principal`);
                fetchData();
            } catch (err) {
                console.error("Error al designar el contacto principal:", err);
                alert("No se pudo actualizar el contacto principal.");
            }
        }
    };


    if (loading) { return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>; }
    if (!paciente) { return <Typography variant="h5" sx={{ p: 3 }}>Residente no encontrado.</Typography>; }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Button component={RouterLink} to="/pacientes" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Volver a Residentes
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

            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                        Condiciones de Base y Tratamientos Fijos
                    </Typography>
                    <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenCondicionModal()}>
                        Añadir Condición
                    </Button>
                </Box>
                {condiciones.length > 0 ? (
                    condiciones.map((condicion) => (
                        <Paper key={condicion.id_condicion} variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">{condicion.nombre_condicion}</Typography>
                                <div>
                                    <IconButton size="small" color="primary" onClick={() => handleOpenCondicionModal(condicion)}><EditIcon /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDeleteCondicion(condicion.id_condicion)}><DeleteIcon /></IconButton>
                                </div>
                            </Box>
                            <Typography variant="body2" color="textSecondary">Diagnosticado: {formatDate(condicion.fecha_diagnostico)}</Typography>
                            <Typography variant="body1" sx={{ my: 1 }}><strong>Observaciones:</strong> {condicion.observaciones || 'N/A'}</Typography>

                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Tratamientos Fijos</Typography>
                                <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenTratamientoModal(condicion.id_condicion)}>Añadir Tratamiento</Button>
                            </Box>
                            <List dense>
                                {condicion.tratamientos.length > 0 ? (
                                    condicion.tratamientos.map(t => (
                                        <ListItem key={t.id_tratamiento} secondaryAction={
                                            <>
                                                <IconButton size="small" edge="end" color="primary" onClick={() => handleOpenTratamientoModal(condicion.id_condicion, t)}><EditIcon /></IconButton>
                                                <IconButton size="small" edge="end" color="error" onClick={() => handleDeleteTratamiento(t.id_tratamiento)}><DeleteIcon /></IconButton>
                                            </>
                                        }>
                                            <ListItemText 
                                                primary={t.nombre_medicamento} 
                                                secondary={`Dosis: ${t.dosis} - Frecuencia: ${t.frecuencia} - Intervalo: cada ${t.intervalo_dias} días`} 
                                            />
                                        </ListItem>
                                    ))
                                ) : <Typography variant="body2" sx={{ fontStyle: 'italic', pl: 2 }}>No hay tratamientos asignados.</Typography>}
                            </List>
                        </Paper>
                    ))
                ) : <Typography>No hay condiciones de base registradas.</Typography>}
            </Paper>

            {/* ... resto del código de historial y familiares sin cambios ... */}
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
                                    <Typography variant="body2"><strong>Observaciones y Plan:</strong> {solicitud.visita.observaciones_medicas || 'Sin observaciones'}</Typography>

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
                                    {solicitud.visita.medicamentos && solicitud.visita.medicamentos.length > 0 && (
                                        <>
                                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                                Medicamentos Recetados en esta Visita:
                                            </Typography>
                                            <List dense disablePadding sx={{ pl: 2 }}>
                                                {solicitud.visita.medicamentos.map(med => (
                                                    <ListItemText
                                                        key={med.nombre}
                                                        primary={`• ${med.nombre}`}
                                                        secondary={`(${med.cantidad} - ${med.tiempo_aplicacion})`}
                                                    />
                                                ))}
                                            </List>
                                        </>
                                    )}
                                </>
                            ) : (
                                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>No se ha registrado una visita para esta solicitud.</Typography>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))
            ) : (
                <Typography>No hay historial de solicitudes para este Residente.</Typography>
            )}

            <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                        Familiares Asignados
                    </Typography>
                    {userRole === 'Administración' && (
                        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenFamiliarModal}>
                            Asignar Familiar
                        </Button>
                    )}
                </Box>
                <Paper sx={{ p: 2 }}>
                    <List>
                        {familiares.length > 0 ? (
                            familiares.map((familiar, index) => (
                                <React.Fragment key={familiar.id_familiar}>
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {familiar.nombre}
                                                    {familiar.es_contacto_principal && (
                                                        <Chip
                                                            icon={<StarIcon />}
                                                            label="Contacto Principal"
                                                            size="small"
                                                            color="primary"
                                                            sx={{ ml: 2 }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <React.Fragment>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {`Parentesco: ${familiar.parentesco}   - Tel: ${familiar.telefono}`}
                                                    </Typography>
                                                    <Typography component="span" variant="body2" display="block" color="text.secondary">
                                                        {`Email: ${familiar.email || 'No tiene'}`}
                                                    </Typography>
                                                </React.Fragment>
                                            }
                                        />
                                        {userRole === 'Administración' && (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {!familiar.es_contacto_principal && (
                                                    <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleSetPrincipal(familiar.id_familiar)}>
                                                        Designar Principal
                                                    </Button>
                                                )}
                                                <IconButton edge="end" color="error" onClick={() => handleUnlinkFamiliar(familiar.id_familiar)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </ListItem>
                                    {index < familiares.length - 1 && <Divider />}
                                </React.Fragment>
                            ))
                        ) : (
                            <ListItem><ListItemText primary="Este residente no tiene familiares asignados." /></ListItem>
                        )}
                    </List>
                </Paper>
            </Box>

            {/* Modal de Familiar sin cambios */}
            <Dialog open={familiarModalOpen} onClose={handleCloseFamiliarModal} fullWidth maxWidth="xs">
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
                    <Button onClick={handleCloseFamiliarModal}>Cancelar</Button>
                    <Button onClick={handleAssignFamiliarSubmit} variant="contained">Asignar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Condición sin cambios */}
            <Dialog open={condicionModal.open} onClose={handleCloseCondicionModal} fullWidth maxWidth="sm">
                <Box component="form" onSubmit={handleCondicionSubmit}>
                    <DialogTitle>{condicionModal.data ? 'Editar Condición' : 'Añadir Nueva Condición'}</DialogTitle>
                    <DialogContent>
                        <TextField name="nombre_condicion" label="Nombre de la Condición" defaultValue={condicionModal.data?.nombre_condicion} fullWidth required margin="dense" />
                        <TextField name="fecha_diagnostico" label="Fecha de Diagnóstico" type="date" defaultValue={condicionModal.data?.fecha_diagnostico?.split('T')[0]} fullWidth required margin="dense" InputLabelProps={{ shrink: true }} />
                        <TextField name="observaciones" label="Observaciones" defaultValue={condicionModal.data?.observaciones} fullWidth multiline rows={3} margin="dense" />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseCondicionModal}>Cancelar</Button>
                        <Button type="submit" variant="contained">Guardar</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* Modal de Tratamiento ACTUALIZADO */}
            <Dialog open={tratamientoModal.open} onClose={handleCloseTratamientoModal} fullWidth maxWidth="sm">
                <form onSubmit={handleTratamientoSubmit}>
                    <DialogTitle>{tratamientoModal.data ? 'Editar Tratamiento' : 'Añadir Nuevo Tratamiento'}</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth margin="dense" required>
                            <InputLabel>Medicamento</InputLabel>
                            <Select
                                name="id_medicamento"
                                value={tratamientoFormData.id_medicamento}
                                label="Medicamento"
                                onChange={handleTratamientoChange}
                            >
                                <MenuItem value="">
                                    <em>Seleccionar medicamento</em>
                                </MenuItem>
                                {medicamentos.map(m => (
                                    <MenuItem key={m.id_medicamento} value={m.id_medicamento}>
                                        {m.nombre} - Q{parseFloat(m.costo || 0).toFixed(2)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <TextField 
                            name="nombre_medicamento" 
                            label="Nombre del Medicamento" 
                            value={tratamientoFormData.nombre_medicamento}
                            onChange={handleTratamientoChange}
                            fullWidth 
                            required 
                            margin="dense"
                            helperText="Este campo se llena automáticamente al seleccionar un medicamento"
                            InputProps={{
                                readOnly: !!tratamientoFormData.id_medicamento
                            }}
                        />
                        
                        <TextField 
                            name="dosis" 
                            label="Dosis (ej: 10mg, 1 tableta)" 
                            value={tratamientoFormData.dosis}
                            onChange={handleTratamientoChange}
                            fullWidth 
                            margin="dense" 
                        />
                        
                        <TextField 
                            name="frecuencia" 
                            label="Frecuencia (ej: 1 vez al día, cada 8 horas)" 
                            value={tratamientoFormData.frecuencia}
                            onChange={handleTratamientoChange}
                            fullWidth 
                            margin="dense" 
                        />
                        
                        <TextField 
                            name="intervalo_dias" 
                            label="Intervalo (días)" 
                            type="number"
                            value={tratamientoFormData.intervalo_dias}
                            onChange={handleTratamientoChange}
                            fullWidth 
                            required
                            margin="dense"
                            helperText="Cada cuántos días se debe dispensar este medicamento"
                            inputProps={{ min: 1, max: 365 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseTratamientoModal}>Cancelar</Button>
                        <Button type="submit" variant="contained">Guardar</Button>
                    </DialogActions>
                </form>
            </Dialog>

        </Box>
    );
};

export default PacienteDetailPage;