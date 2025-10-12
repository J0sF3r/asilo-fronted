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
                else if (role === 'Fundación') {
                    const [solicitudesRes, medicosRes, enfermerosRes] = await Promise.all([
                        api.get('/solicitudes'), api.get('/medicos'), api.get('/enfermeros')
                    ]);
                    setSolicitudes(solicitudesRes.data);
                    setEnfermeros(enfermerosRes.data);
                    setMedicosGenerales(medicosRes.data.filter(m => m.tipo === 'General'));
                    setMedicosEspecialistas(medicosRes.data.filter(m => m.tipo === 'Especialista'));
                }
                else if (role === 'Medico General') {
                    const [solicitudesRes, enfermerosRes] = await Promise.all([
                        api.get('/solicitudes'), api.get('/enfermeros')
                    ]);
                    setSolicitudes(solicitudesRes.data);
                    setEnfermeros(enfermerosRes.data);
                }
            } catch (err) {
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
        if (solicitud) { // Editando/Procesando una solicitud existente
            setFormData({
                // Campos para Medico General
                especialidad_requerida: solicitud.especialidad_requerida || '',
                id_enfermero: solicitud.id_enfermero || '',
                diagnostico_general: solicitud.diagnostico_general || '',
                // Campos para Fundación/Admin
                id_medico_especialista: solicitud.id_medico_especialista || '',
                fecha_visita: '',
                lugar: 'Hospital General del Sur', // Valor por defecto
                costo_consulta: '',
                descuento_porcentaje: 0,
                costo_final_con_descuento: ''
            });
        } else { // Creando una nueva solicitud
            setFormData({
                id_paciente: '',
                id_medico_general: '',
                motivo: ''
            });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => setModalOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newForm = { ...prev, [name]: value };

            if (name === 'id_medico_especialista') {
                const medico = medicosEspecialistas.find(m => m.id_medico === parseInt(value, 10));
                if (medico) {
                    newForm.costo_consulta = medico.costo_consulta || '';
                }
            }

            if (name === 'costo_consulta' || name === 'descuento_porcentaje' || name === 'id_medico_especialista') {
                const costo = parseFloat(newForm.costo_consulta) || 0;
                const descuento = parseFloat(newForm.descuento_porcentaje) || 0;
                if (descuento >= 0 && descuento <= 100) {
                    const costoFinal = costo - (costo * (descuento / 100));
                    newForm.costo_final_con_descuento = costoFinal.toFixed(2);
                }
            }
            return newForm;
        });
    };

    const handleSubmit = async () => {
        try {
            if (!currentSolicitud) {
                await api.post('/solicitudes', formData);
                alert('¡Solicitud creada exitosamente!');
            } else if (userRole === 'Medico General' && currentSolicitud.estado === 'pendiente') {
                await api.put(`/solicitudes/${currentSolicitud.id_solicitud}/aprobar`, formData);
                alert('¡Solicitud aprobada exitosamente!');
            } else if ((userRole === 'Fundación' || userRole === 'Administración') && currentSolicitud.estado === 'aprobada') {
                // Enviar solo los campos que el backend necesita
                const dataToSend = {
                    id_medico_especialista: formData.id_medico_especialista,
                    fecha_visita: formData.fecha_visita,
                    lugar: formData.lugar,
                    costo_consulta: formData.costo_consulta,
                    descuento_porcentaje: formData.descuento_porcentaje
                };

                await api.post(`/solicitudes/${currentSolicitud.id_solicitud}/programar`, dataToSend);
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
                            <Select native value={formData.id_paciente || ''} onChange={handleChange} inputProps={{ name: 'id_paciente', id: 'paciente-select-native' }}>
                                <option aria-label="None" value="" />
                                {pacientes.map(p => (<option key={p.id_paciente} value={p.id_paciente}>{p.nombre}</option>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel variant="standard" htmlFor="medico-general-select-native">Médico General</InputLabel>
                            <Select native value={formData.id_medico_general || ''} onChange={handleChange} inputProps={{ name: 'id_medico_general', id: 'medico-general-select-native' }}>
                                <option aria-label="None" value="" />
                                {medicosGenerales.map(m => (<option key={m.id_medico} value={m.id_medico}>{m.nombre}</option>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField name="motivo" label="Motivo de la Solicitud" fullWidth multiline rows={3} onChange={handleChange} value={formData.motivo || ''} variant="filled" />
                    </Grid>
                </Grid>
            );
        }

        if (userRole === 'Medico General' && currentSolicitud.estado === 'pendiente') {
            return (
                <Grid container spacing={3} sx={{ pt: 1 }}>
                    <Grid item xs={12}>
                        <TextField name="especialidad_requerida" label="Especialidad Requerida" fullWidth onChange={handleChange} value={formData.especialidad_requerida || ''} variant="filled" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField name="diagnostico_general" label="Diagnóstico Preliminar" fullWidth multiline rows={3} onChange={handleChange} value={formData.diagnostico_general || ''} variant="filled" />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel variant="standard" htmlFor="enfermero-select-native">Enfermero/a</InputLabel>
                            <Select native value={formData.id_enfermero || ''} onChange={handleChange} inputProps={{ name: 'id_enfermero', id: 'enfermero-select-native' }}>
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
                <Grid container spacing={2} sx={{ pt: 1 }}>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <InputLabel>Médico Especialista</InputLabel>
                            <Select
                                name="id_medico_especialista"
                                value={formData.id_medico_especialista || ''}
                                onChange={handleChange}
                                label="Médico Especialista"
                            >
                                {medicosEspecialistas.map(m => (
                                    <MenuItem key={m.id_medico} value={m.id_medico}>
                                        {m.nombre} ({m.especialidad}) - Q{parseFloat(m.costo_consulta || 0).toFixed(2)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="fecha_visita" label="Fecha y Hora" type="datetime-local" fullWidth required InputLabelProps={{ shrink: true }} onChange={handleChange} value={formData.fecha_visita || ''} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="lugar" label="Lugar de la Cita" fullWidth required onChange={handleChange} value={formData.lugar || ''} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField name="costo_consulta" label="Costo Base (Q)" type="number" fullWidth required onChange={handleChange} value={formData.costo_consulta || ''} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField name="descuento_porcentaje" label="Descuento (%)" type="number" fullWidth onChange={handleChange} value={formData.descuento_porcentaje || ''} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField name="costo_final_con_descuento" label="Costo Final (Q)" type="number" fullWidth required InputProps={{ readOnly: true }} value={formData.costo_final_con_descuento || ''} />
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