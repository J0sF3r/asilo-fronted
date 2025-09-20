// --- CÓDIGO COMPLETO Y OPTIMIZADO ---

import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Chip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

const SolicitudesPage = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentSolicitud, setCurrentSolicitud] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [pacientes, setPacientes] = useState([]);
    const [medicosGenerales, setMedicosGenerales] = useState([]);
    const [medicosEspecialistas, setMedicosEspecialistas] = useState([]);
    const [enfermeros, setEnfermeros] = useState([]);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = jwtDecode(token);
        const role = decoded.user.nombre_rol;
        setUserRole(role);

        const fetchInitialData = async () => {
            try {
                // El rol de Admin/Fundación necesita todos los datos para los formularios
                // El rol de Admin necesita todos los datos para los formularios
                if (role === 'Administración') {
                    const [solicitudesRes, pacientesRes, medicosRes, enfermerosRes] = await Promise.all([
                        api.get('/solicitudes'), api.get('/pacientes'), api.get('/medicos'), api.get('/enfermeros')
                    ]);
                    setSolicitudes(solicitudesRes.data);
                    setPacientes(pacientesRes.data);
                    setEnfermeros(enfermerosRes.data);
                    setMedicosGenerales(medicosRes.data.filter(m => m.tipo === 'General'));
                    setMedicosEspecialistas(medicosRes.data.filter(m => m.tipo === 'Especialista'));
                }
                // El rol de Fundación necesita casi todo, EXCEPTO la lista de pacientes
                else if (role === 'Fundación') {
                     const [solicitudesRes, medicosRes, enfermerosRes] = await Promise.all([
                        api.get('/solicitudes'), api.get('/medicos'), api.get('/enfermeros')
                    ]);
                    setSolicitudes(solicitudesRes.data);
                    setEnfermeros(enfermerosRes.data);
                    setMedicosGenerales(medicosRes.data.filter(m => m.tipo === 'General'));
                    setMedicosEspecialistas(medicosRes.data.filter(m => m.tipo === 'Especialista'));
                }
                // El Médico General solo necesita la lista de solicitudes y de enfermeros
                else if (role === 'Medico General') {
                    const [solicitudesRes, enfermerosRes] = await Promise.all([
                        api.get('/solicitudes'), api.get('/enfermeros')
                    ]);
                    setSolicitudes(solicitudesRes.data);
                    setEnfermeros(enfermerosRes.data);
                }
            }  catch (err) {
                console.error("Error al cargar datos:", err);
            }
        };
        fetchInitialData();
    }, []);

    const fetchSolicitudes = async () => {
        const res = await api.get('/solicitudes');
        setSolicitudes(res.data);
    };

    const handleOpenModal = (solicitud = null) => {
        setCurrentSolicitud(solicitud);
        if (solicitud) {
            setFormData({
                especialidad_requerida: solicitud.especialidad_requerida || '',
                id_enfermero: solicitud.id_enfermero || '',
                diagnostico_general: solicitud.diagnostico_general || '',
                id_medico_especialista: solicitud.id_medico_especialista || '',
                fecha_visita: '',
                lugar: ''
            });
        } else {
            setFormData({
                id_paciente: '',
                id_medico_general: '',
                motivo: ''
            });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => setModalOpen(false);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        try {
            if (!currentSolicitud) {
                await api.post('/solicitudes', formData);
                alert('¡Solicitud creada exitosamente!');
            } else if (userRole === 'Medico General' && currentSolicitud.estado === 'pendiente') {
                await api.put(`/solicitudes/${currentSolicitud.id_solicitud}/aprobar`, formData);
                alert('¡Solicitud aprobada exitosamente!');
            } else if ((userRole === 'Fundación' || userRole === 'Administración') && currentSolicitud.estado === 'aprobada') {
                await api.post(`/solicitudes/${currentSolicitud.id_solicitud}/programar`, formData);
                alert('¡Cita programada exitosamente!');
            }
            handleCloseModal();
            fetchSolicitudes();
        } catch (err) {
            console.error("Error al procesar la solicitud:", err.response?.data?.msg || err.message);
            alert(`Error: ${err.response?.data?.msg || 'No se pudo procesar la solicitud.'}`);
        }
    };

    const getStatusChip = (status) => {
        const colors = {
            pendiente: 'warning',
            aprobada: 'info',
            programada: 'success',
            cancelada: 'error'
        };
        return <Chip label={status} color={colors[status] || 'default'} size="small" />;
    };

    const renderModalContent = () => {
        if (!currentSolicitud) {
            return (
                <Grid container spacing={3} sx={{ pt: 1 }}>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel variant="standard" htmlFor="paciente-select-native">Paciente</InputLabel>
                            <Select
                                native
                                value={formData.id_paciente || ''}
                                onChange={handleChange}
                                inputProps={{ name: 'id_paciente', id: 'paciente-select-native' }}
                            >
                                <option aria-label="None" value="" />
                                {pacientes.map(p => (<option key={p.id_paciente} value={p.id_paciente}>{p.nombre}</option>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel variant="standard" htmlFor="medico-general-select-native">Médico General</InputLabel>
                            <Select
                                native
                                value={formData.id_medico_general || ''}
                                onChange={handleChange}
                                inputProps={{ name: 'id_medico_general', id: 'medico-general-select-native' }}
                            >
                                <option aria-label="None" value="" />
                                {medicosGenerales.map(m => (<option key={m.id_medico} value={m.id_medico}>{m.nombre}</option>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField name="motivo" label="Motivo de la Solicitud" fullWidth multiline rows={3} onChange={handleChange} value={formData.motivo || ''} variant="filled"/>
                    </Grid>
                </Grid>
            );
        }

        if (userRole === 'Medico General' && currentSolicitud.estado === 'pendiente') {
            return (
                <Grid container spacing={3} sx={{ pt: 1 }}>
                    <Grid item xs={12}>
                        <TextField name="especialidad_requerida" label="Especialidad Requerida" fullWidth onChange={handleChange} value={formData.especialidad_requerida || ''} variant="filled"/>
                    </Grid>
                     <Grid item xs={12}>
                        <TextField name="diagnostico_general" label="Diagnóstico Preliminar" fullWidth multiline rows={3} onChange={handleChange} value={formData.diagnostico_general || ''} variant="filled"/>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel variant="standard" htmlFor="enfermero-select-native">Enfermero/a</InputLabel>
                            <Select
                                native
                                value={formData.id_enfermero || ''}
                                onChange={handleChange}
                                inputProps={{ name: 'id_enfermero', id: 'enfermero-select-native' }}
                            >
                                <option aria-label="None" value="" />
                                {enfermeros.map(e => (<option key={e.id_enfermero} value={e.id_enfermero}>{e.nombre}</option>))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            );
        }

        if ((userRole === 'Fundación' || userRole === 'Administración') && currentSolicitud.estado === 'aprobada') {
            return (
                <Grid container spacing={3} sx={{ pt: 1 }}>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel variant="standard" htmlFor="medico-especialista-select-native">Médico Especialista</InputLabel>
                            <Select
                                native
                                value={formData.id_medico_especialista || ''}
                                onChange={handleChange}
                                inputProps={{ name: 'id_medico_especialista', id: 'medico-especialista-select-native' }}
                            >
                                <option aria-label="None" value="" />
                                {medicosEspecialistas.map(m => (<option key={m.id_medico} value={m.id_medico}>{m.nombre} ({m.especialidad})</option>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="fecha_visita" label="Fecha y Hora" type="datetime-local" fullWidth required InputLabelProps={{ shrink: true }} onChange={handleChange} value={formData.fecha_visita || ''} variant="filled"/>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="lugar" label="Lugar de la Cita" fullWidth required onChange={handleChange} value={formData.lugar || ''} variant="filled"/>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField name="costo_consulta" label="Costo de la Consulta (Q)" type="number" fullWidth required onChange={handleChange} value={formData.costo_consulta || ''} variant="filled"/>
                    </Grid>
                </Grid>
            );
        }

        return <Typography>No hay acciones disponibles para esta solicitud con tu rol actual.</Typography>;
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">Gestión de Solicitudes</Typography>
                {(userRole === 'Administración' || userRole === 'Fundación') && (
                    <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenModal()}>
                        Crear Solicitud
                    </Button>
                )}
            </Box>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Paciente</TableCell>
                            <TableCell>Médico General</TableCell>
                            <TableCell>Motivo</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {solicitudes.map((sol) => (
                            <TableRow key={sol.id_solicitud}>
                                <TableCell>{sol.nombre_paciente}</TableCell>
                                <TableCell>{sol.nombre_medico_general}</TableCell>
                                <TableCell>{sol.motivo}</TableCell>
                                <TableCell>{getStatusChip(sol.estado)}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpenModal(sol)}>
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>
                    {!currentSolicitud ? 'Crear Nueva Solicitud' : `Procesar Solicitud #${currentSolicitud.id_solicitud}`}
                </DialogTitle>
                <DialogContent>
                    {renderModalContent()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SolicitudesPage;