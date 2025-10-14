import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, DialogContentText, MenuItem,
    Select, InputLabel, FormControl,

} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Search
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import filtroSexo from 'lodash.debounce';
import setFiltroSexo from 'lodash.debounce';
import setSearchTerm from 'lodash.debounce';
import searchTerm from 'lodash.debounce';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PacientesPage = () => {
    const [pacientes, setPacientes] = useState([]);
    const [open, setOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [currentPacienteId, setCurrentPacienteId] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [pacienteToDelete, setPacienteToDelete] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        fecha_nacimiento: '',
        sexo: '',
        direccion: '',
        telefono: '',
        email: '',
        fecha_ingreso: ''
    });

    const fetchPacientes = async () => {
        try {
            const res = await api.get('/pacientes');
            setPacientes(res.data);
        } catch (err) {
            console.error("Error al obtener los pacientes:", err);
            alert("No se pudo cargar la lista de pacientes.");
        }
    };

    useEffect(() => {
        // Leemos el token para saber el rol del usuario
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setUserRole(decoded.user.nombre_rol);
        }

        fetchPacientes();
    }, []);


    const resetForm = () => {
        setFormData({ nombre: '', fecha_nacimiento: '', fecha_ingreso: '', sexo: '', direccion: '', telefono: '', email: '' });
        setIsEditing(false);
        setCurrentPacienteId(null);
    };

    const handleOpenCreate = () => {
        resetForm();
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    const handleOpenEdit = (paciente) => {
        setIsEditing(true);
        setCurrentPacienteId(paciente.id_paciente);
        const formattedDate = paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toISOString().split('T')[0] : '';
        setFormData({
            nombre: paciente.nombre,
            fecha_nacimiento: formattedDate,
            sexo: paciente.sexo,
            direccion: paciente.direccion,
            telefono: paciente.telefono,
            email: paciente.email,
        });
        setOpen(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            if (isEditing) {
                await api.put(`/pacientes/${currentPacienteId}`, formData);
                alert('¡Paciente actualizado exitosamente!');
            } else {
                await api.post('/pacientes', formData);
                alert('¡Paciente registrado exitosamente!');
            }
            handleClose();
            fetchPacientes();
        } catch (err) {
            console.error("Error al guardar el paciente:", err);
            alert('Error al guardar el paciente. Verifique los datos.');
        }
    };

    // --- NUEVAS FUNCIONES PARA MANEJAR LA ELIMINACIÓN ---
    const handleDeleteOpen = (paciente) => {
        setPacienteToDelete(paciente);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteClose = () => {
        setDeleteConfirmOpen(false);
        setPacienteToDelete(null);
    };
    // Filtrar pacientes
const pacientesFiltrados = pacientes.filter(p => {
    const matchNombre = p.nombre 
        ? p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        : false;
    const matchSexo = filtroSexo === 'Todos' || p.sexo === filtroSexo;
    return matchNombre && matchSexo;
});

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/pacientes/${pacienteToDelete.id_paciente}`);
            alert('Paciente eliminado exitosamente.');
            fetchPacientes();
        } catch (err) {
            console.error("Error al eliminar el paciente:", err);
            alert("No se pudo eliminar al paciente.");
        } finally {
            handleDeleteClose();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-GT', options);
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Gestión de Pacientes
                </Typography>

                {userRole === 'Administración' && (
                    <Button variant="contained" startIcon={<PersonAddAlt1Icon />} onClick={handleOpenCreate}>
                        Registrar Nuevo Paciente
                    </Button>
                )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon />
                    }}
                    sx={{ flexGrow: 1 }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Sexo</InputLabel>
                    <Select
                        value={filtroSexo}
                        label="Sexo"
                        onChange={(e) => setFiltroSexo(e.target.value)}
                    >
                        <MenuItem value="Todos">Todos</MenuItem>
                        <MenuItem value="Masculino">Masculino</MenuItem>
                        <MenuItem value="Femenino">Femenino</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fecha de Nacimiento</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Edad</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Sexo</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>

                            {userRole === 'Administración' && (
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                       {pacientesFiltrados.map(paciente => (
                            <TableRow key={paciente.id_paciente}>
                                
                                <TableCell>
                                    <Link to={`/pacientes/${paciente.id_paciente}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {paciente.nombre}
                                    </Link>
                                </TableCell>
                                <TableCell>{formatDate(paciente.fecha_nacimiento)}</TableCell>
                                <TableCell>{paciente.edad} años</TableCell>
                                <TableCell>{paciente.sexo}</TableCell>
                                <TableCell>{paciente.telefono}</TableCell>

                                {userRole === 'Administración' && (
                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={() => handleOpenEdit(paciente)}><EditIcon /></IconButton>
                                        <IconButton color="error" onClick={() => handleDeleteOpen(paciente)}><DeleteOutlineIcon /></IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal para Registrar y Editar Paciente */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField required name="nombre" label="Nombre Completo" fullWidth value={formData.nombre} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required name="fecha_nacimiento" label="Fecha de Nacimiento" type="date" InputLabelProps={{ shrink: true }} fullWidth value={formData.fecha_nacimiento} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required name="fecha_ingreso" label="Fecha de Ingreso al Asilo" type="date" InputLabelProps={{ shrink: true }} fullWidth value={formData.fecha_ingreso} onChange={handleChange}
                            />
                        </Grid>

                        <FormControl fullWidth margin="dense" required>
                            <InputLabel>Sexo</InputLabel>
                            <Select
                                name="sexo"
                                value={formData.sexo}
                                label="Sexo"
                                onChange={handleChange}
                            >
                                <MenuItem value="Masculino">Masculino</MenuItem>
                                <MenuItem value="Femenino">Femenino</MenuItem>
                            </Select>
                        </FormControl>

                        <Grid item xs={12}>
                            <TextField name="direccion" label="Dirección" fullWidth multiline rows={2} value={formData.direccion} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="telefono" label="Teléfono" fullWidth value={formData.telefono} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="email" label="Correo Electrónico" type="email" fullWidth value={formData.email} onChange={handleChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* --- NUEVO: Diálogo de Confirmación para Eliminar --- */}
            <Dialog open={deleteConfirmOpen} onClose={handleDeleteClose}>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas eliminar a <strong>{pacienteToDelete?.nombre}</strong>? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteClose}>Cancelar</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PacientesPage;