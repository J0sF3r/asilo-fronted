import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../utils/api';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);

    // Estados para los catálogos de vinculación
    const [roles, setRoles] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [enfermeros, setEnfermeros] = useState([]);
    const [familiares, setFamiliares] = useState([]);

    // Estado para el formulario del nuevo usuario
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        id_rol: '',
        nombre_completo: '',
        id_medico: null,
        id_enfermero: null,
        id_familiar: null
    });
    // Estado para el usuario en edición
    const [editingUser, setEditingUser] = useState(null);

    // Función para obtener la lista de usuarios
    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Error al obtener los usuarios:", err);
        }
    };

    // useEffect para cargar todos los datos necesarios al montar el componente
    useEffect(() => {
        fetchUsers();

        const fetchCatalogos = async () => {
            try {
                const [rolesRes, medicosRes, enfermerosRes, familiaresRes] = await Promise.all([
                    api.get('/roles'),
                    api.get('/medicos'),
                    api.get('/enfermeros'),
                    api.get('/familiares')
                ]);
                setRoles(rolesRes.data);
                setMedicos(medicosRes.data);
                setEnfermeros(enfermerosRes.data);
                setFamiliares(familiaresRes.data);
            } catch (err) {
                console.error("Error al obtener los catálogos:", err);
            }
        };
        fetchCatalogos();
    }, []);

    const handleClickOpen = async (user = null) => {
        if (user && user.id_usuario) {
            // Editar usuario existente
            try {
                //Buscamos los datos completos y actualizados del usuario
                const res = await api.get(`/users/${user.id_usuario}`);
                const fullUserData = res.data;

                //Llenamos el formulario con los datos completos recibidos
                setEditingUser(fullUserData);
                setNewUser({
                    username: fullUserData.username || '',
                    nombre_completo: fullUserData.nombre_completo || '',
                    email: fullUserData.email || '',
                    password: '', 
                    id_rol: fullUserData.id_rol,
                    id_medico: fullUserData.id_medico || null,
                    id_enfermero: fullUserData.id_enfermero || null,
                    id_familiar: fullUserData.id_familiar || null,
                    estado: fullUserData.estado || 'activo'
                });

                setOpen(true);

            } catch (err) {
                console.error("Error al obtener los detalles del usuario:", err);
                alert("No se pudieron cargar los datos para editar.");
            }
        } else {
            // Crear nuevo usuario
            setEditingUser(null);
            setNewUser({
                username: '',
                email: '',
                password: '',
                id_rol: '',
                nombre_completo: '',
                id_medico: null,
                id_enfermero: null,
                id_familiar: null,
                estado: 'activo'
            });
            setOpen(true);
        }
    };

    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedUser = { ...newUser, [name]: value };

        const generateUsername = (fullName = '') => {
            const parts = fullName.toLowerCase().split(' ');
            if (parts.length < 1) return '';
            if (parts.length === 1) return parts[0];
            return (parts[0][0] + parts[parts.length - 1]).replace(/[^a-z0-9]/gi, '');
        };

        if (name === 'id_medico') {
            const medico = medicos.find(m => m.id_medico === value);
            if (medico) {
                updatedUser.username = generateUsername(medico.nombre);
                updatedUser.email = medico.email || '';
            }
        } else if (name === 'id_enfermero') {
            const enfermero = enfermeros.find(en => en.id_enfermero === value);
            if (enfermero) {
                updatedUser.username = generateUsername(enfermero.nombre);
                updatedUser.email = enfermero.email || '';
            }
        } else if (name === 'id_familiar') {
            const familiar = familiares.find(f => f.id_familiar === value);
            if (familiar) {
                updatedUser.username = generateUsername(familiar.nombre);
                updatedUser.email = familiar.email || '';
            }
        }

        setNewUser(updatedUser);
    };
    // Función para manejar la desactivación de un usuario
    const handleDelete = async (userId) => {
        if (window.confirm('¿Estás seguro de que quieres desactivar a este usuario?')) {
            try {
                await api.delete(`/users/${userId}`);
                fetchUsers(); 
                alert('Usuario desactivado.');
            } catch (err) {
                console.error("Error al desactivar usuario:", err);
                alert('No se pudo desactivar el usuario.');
            }
        }
    };
    const handleSubmit = async () => {
        try {
            console.log("Datos a enviar:", newUser);
            if (editingUser) {
                // Si estamos editando, usamos PUT
                await api.put(`/users/${editingUser.id_usuario}`, newUser);
            } else {
                // Si no, usamos POST para crear
                await api.post('/auth/register', newUser);
            }
            handleClose();
            fetchUsers();
            alert(`¡Usuario ${editingUser ? 'actualizado' : 'creado'} exitosamente!`);
        } catch (err) { 
                alert('Error: ' + (err.response?.data?.msg || err.message));
        }
    };

    const selectedRoleName = roles.find(r => r.id_rol === newUser.id_rol)?.nombre_rol;
    const medicosEspecialistas = medicos.filter(m => m.tipo === 'Especialista');
    const medicosGenerales = medicos.filter(m => m.tipo === 'General');

    return (

        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Administración de Usuarios
                </Typography>
                <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleClickOpen}>
                    Crear Nuevo Usuario
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nombre Real</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Rol</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id_usuario}>
                                <TableCell>{user.nombre_real}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.nombre_rol}</TableCell>
                                <TableCell>{user.estado}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleClickOpen(user)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(user.id_usuario)}><DeleteOutlineIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogContent>
                    <TextField autoFocus required margin="dense" name="username" label="Nombre de Usuario" type="text" fullWidth variant="outlined" onChange={handleChange} value={newUser.username} />
                    <TextField required margin="dense" name="nombre_completo" label="Nombre Completo " type="text" fullWidth variant="outlined" onChange={handleChange} value={newUser.nombre_completo || ''} />
                    <TextField margin="dense" name="email" label="Correo Electrónico (Opcional)" type="email" fullWidth variant="outlined" onChange={handleChange} value={newUser.email} />
                    <TextField required margin="dense" name="password" label="Contraseña" type="password" fullWidth variant="outlined" onChange={handleChange} value={newUser.password} />

                    <FormControl fullWidth required margin="dense">
                        <InputLabel>Rol</InputLabel>
                        <Select name="id_rol" label="Rol" value={newUser.id_rol} onChange={handleChange}>
                            {roles.map((rol) => (<MenuItem key={rol.id_rol} value={rol.id_rol}>{rol.nombre_rol}</MenuItem>))}
                        </Select>
                    </FormControl>

                    {selectedRoleName === 'Medico Especialista' && (
                        <FormControl fullWidth required margin="dense">
                            <InputLabel>Vincular a Médico Especialista</InputLabel>
                            <Select name="id_medico" label="Vincular a Médico Especialista" value={newUser.id_medico || ''} onChange={handleChange}>
                                {/* Usamos la lista filtrada de especialistas */}
                                {medicosEspecialistas.map((medico) => (
                                    <MenuItem key={medico.id_medico} value={medico.id_medico}>{medico.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    {selectedRoleName === 'Medico General' && (
                        <FormControl fullWidth required margin="dense">
                            <InputLabel>Vincular a Médico General</InputLabel>
                            <Select name="id_medico" label="Vincular a Médico General" value={newUser.id_medico || ''} onChange={handleChange}>
                                {/* Usamos la lista filtrada de generales */}
                                {medicosGenerales.map((medico) => (
                                    <MenuItem key={medico.id_medico} value={medico.id_medico}>{medico.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    {selectedRoleName === 'Enfermero' && (
                        <FormControl fullWidth required margin="dense">
                            <InputLabel>Vincular a Enfermero/a</InputLabel>
                            <Select name="id_enfermero" label="Vincular a Enfermero/a" value={newUser.id_enfermero || ''} onChange={handleChange}>
                                {enfermeros.map((enfermero) => (<MenuItem key={enfermero.id_enfermero} value={enfermero.id_enfermero}>{enfermero.nombre}</MenuItem>))}
                            </Select>
                        </FormControl>
                    )}
                    {selectedRoleName === 'Familiar' && (
                        <FormControl fullWidth required margin="dense">
                            <InputLabel>Vincular a Familiar</InputLabel>
                            <Select name="id_familiar" label="Vincular a Familiar" value={newUser.id_familiar || ''} onChange={handleChange}>
                                {familiares.map((familiar) => (<MenuItem key={familiar.id_familiar} value={familiar.id_familiar}>{familiar.nombre}</MenuItem>))}
                            </Select>
                        </FormControl>
                    )}
                    <FormControl fullWidth required margin="dense">
                        <InputLabel>Estado</InputLabel>
                        <Select
                            name="estado"
                            label="Estado"
                            value={newUser.estado || 'activo'}
                            onChange={handleChange}
                        >
                            <MenuItem value="activo">activo</MenuItem>
                            <MenuItem value="inactivo">inactivo</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UsersPage;
