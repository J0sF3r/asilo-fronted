import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, Chip, IconButton, Tooltip,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import api from '../utils/api';

const DonantesPage = () => {
    const [donantes, setDonantes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal de donante
    const [modalOpen, setModalOpen] = useState(false);
    const [currentDonante, setCurrentDonante] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: '',
        contacto: '',
        email: '',
        telefono: '',
        pais: '',
        notas: ''
    });

    // Modal de registrar donación
    const [modalDonacionOpen, setModalDonacionOpen] = useState(false);
    const [donanteSeleccionado, setDonanteSeleccionado] = useState(null);
    const [donacionData, setDonacionData] = useState({ monto: '', descripcion: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/donantes');
            setDonantes(res.data);
        } catch (err) {
            console.error("Error al cargar donantes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // GESTIÓN DE DONANTES 
    const handleOpenModal = (donante = null) => {
        if (donante) {
            setCurrentDonante(donante);
            setFormData({
                nombre: donante.nombre,
                tipo: donante.tipo,
                contacto: donante.contacto || '',
                email: donante.email || '',
                telefono: donante.telefono || '',
                pais: donante.pais || '',
                notas: donante.notas || ''
            });
        } else {
            setCurrentDonante(null);
            setFormData({ nombre: '', tipo: '', contacto: '', email: '', telefono: '', pais: '', notas: '' });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentDonante(null);
        setFormData({ nombre: '', tipo: '', contacto: '', email: '', telefono: '', pais: '', notas: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.nombre || !formData.tipo) {
            alert('Nombre y tipo son requeridos.');
            return;
        }

        try {
            if (currentDonante) {
                await api.put(`/donantes/${currentDonante.id_donante}`, formData);
                alert('Donante actualizado exitosamente.');
            } else {
                await api.post('/donantes', formData);
                alert('Donante registrado exitosamente.');
            }
            handleCloseModal();
            fetchData();
        } catch (err) {
            console.error("Error al guardar donante:", err);
            alert('No se pudo guardar el donante.');
        }
    };

    const handleToggleActivo = async (id, activo) => {
        const accion = activo ? 'desactivar' : 'activar';
        if (!window.confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} este donante?`)) return;

        try {
            await api.put(`/donantes/${id}/${accion}`);
            fetchData();
        } catch (err) {
            console.error(`Error al ${accion} donante:`, err);
            alert(`No se pudo ${accion} el donante.`);
        }
    };

    // REGISTRAR DONACIÓN 
    const handleOpenDonacion = (donante) => {
        setDonanteSeleccionado(donante);
        setDonacionData({ monto: '', descripcion: '' });
        setModalDonacionOpen(true);
    };

    const handleCloseDonacion = () => {
        setModalDonacionOpen(false);
        setDonanteSeleccionado(null);
        setDonacionData({ monto: '', descripcion: '' });
    };

    const handleDonacionChange = (e) => {
        setDonacionData({ ...donacionData, [e.target.name]: e.target.value });
    };

    const handleDonacionSubmit = async () => {
        if (!donacionData.monto || parseFloat(donacionData.monto) <= 0) {
            alert('Por favor ingresa un monto válido.');
            return;
        }

        try {
            await api.post(`/donantes/${donanteSeleccionado.id_donante}/donar`, donacionData);
            alert('Donación registrada exitosamente.');
            handleCloseDonacion();
        } catch (err) {
            console.error("Error al registrar donación:", err);
            alert('No se pudo registrar la donación.');
        }
    };

    const formatCurrency = (amount) => amount ? `Q${parseFloat(amount).toFixed(2)}` : '-';

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Donantes
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddCircleOutlineIcon />} 
                    onClick={() => handleOpenModal()}
                >
                    Registrar Donante
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>País</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Fecha Registro</TableCell>
                            <TableCell align="center">Estado</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {donantes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No hay donantes registrados
                                </TableCell>
                            </TableRow>
                        ) : (
                            donantes.map((d) => (
                                <TableRow key={d.id_donante}>
                                    <TableCell>{d.nombre}</TableCell>
                                    <TableCell>{d.tipo}</TableCell>
                                    <TableCell>{d.pais || '-'}</TableCell>
                                    <TableCell>{d.email || '-'}</TableCell>
                                    <TableCell>{d.telefono || '-'}</TableCell>
                                    <TableCell>
                                        {d.fecha_registro ? new Date(d.fecha_registro).toLocaleDateString('es-GT') : '-'}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip 
                                            label={d.activo ? 'Activo' : 'Inactivo'}
                                            color={d.activo ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            {d.activo && (
                                                <Tooltip title="Registrar Donación">
                                                    <IconButton 
                                                        size="small" 
                                                        color="success" 
                                                        onClick={() => handleOpenDonacion(d)}
                                                    >
                                                        <VolunteerActivismIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Editar">
                                                <IconButton size="small" color="primary" onClick={() => handleOpenModal(d)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={d.activo ? 'Desactivar' : 'Activar'}>
                                                <IconButton 
                                                    size="small" 
                                                    color={d.activo ? 'error' : 'success'}
                                                    onClick={() => handleToggleActivo(d.id_donante, d.activo)}
                                                >
                                                    {d.activo ? <DeleteIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal Donante */}
            <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
                <DialogTitle>{currentDonante ? 'Editar Donante' : 'Registrar Nuevo Donante'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="nombre"
                                label="Nombre *"
                                fullWidth
                                required
                                value={formData.nombre}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Tipo de Donante</InputLabel>
                                <Select
                                    name="tipo"
                                    value={formData.tipo}
                                    label="Tipo de Donante"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="Empresa Internacional">Empresa Internacional</MenuItem>
                                    <MenuItem value="Empresa Nacional">Empresa Nacional</MenuItem>
                                    <MenuItem value="Gobierno">Gobierno</MenuItem>
                                    <MenuItem value="Persona Particular">Persona Particular</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="email"
                                label="Email"
                                type="email"
                                fullWidth
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="telefono"
                                label="Teléfono"
                                fullWidth
                                value={formData.telefono}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="pais"
                                label="País"
                                fullWidth
                                value={formData.pais}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="contacto"
                                label="Contacto (Persona de contacto)"
                                fullWidth
                                value={formData.contacto}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="notas"
                                label="Notas"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.notas}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal Registrar Donación */}
            <Dialog open={modalDonacionOpen} onClose={handleCloseDonacion} maxWidth="sm" fullWidth>
                <DialogTitle>Registrar Donación</DialogTitle>
                <DialogContent>
                    {donanteSeleccionado && (
                        <Box sx={{ pt: 1 }}>
                            <Typography variant="h6" gutterBottom>{donanteSeleccionado.nombre}</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {donanteSeleccionado.tipo}
                            </Typography>
                            
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        autoFocus
                                        name="monto"
                                        label="Monto de la Donación (Q) *"
                                        type="number"
                                        fullWidth
                                        required
                                        value={donacionData.monto}
                                        onChange={handleDonacionChange}
                                        inputProps={{ min: 0, step: 0.01 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="descripcion"
                                        label="Descripción (opcional)"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={donacionData.descripcion}
                                        onChange={handleDonacionChange}
                                        placeholder="Ej: Donación para medicamentos, Donación navideña, etc."
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDonacion}>Cancelar</Button>
                    <Button onClick={handleDonacionSubmit} variant="contained" color="success">
                        Registrar Donación
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DonantesPage;