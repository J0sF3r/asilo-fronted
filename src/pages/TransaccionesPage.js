import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, FormControl, InputLabel,
    Select, MenuItem, Chip, IconButton, Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../utils/api';

const TransaccionesPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    //capturar rol de usuario para ocultar botones
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setUserRole(decoded.user.nombre_rol);
        }
    }, []);
    // Filtros
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroEstado, setFiltroEstado] = useState('todos');

    // Modal de transacción (ingreso/gasto)
    const [modalOpen, setModalOpen] = useState(false);
    const [isGasto, setIsGasto] = useState(false);
    const [formData, setFormData] = useState({
        tipo: '',
        descripcion: '',
        monto: ''
    });

    // Modal de descuento
    const [modalDescuentoOpen, setModalDescuentoOpen] = useState(false);
    const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
    const [descuentoData, setDescuentoData] = useState({ descuento_aplicado: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/transacciones');
            setData(res.data);
        } catch (err) {
            console.error("Error al cargar transacciones:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ========== MODAL DE INGRESO/GASTO ==========
    const handleOpenModal = (gasto = false) => {
        setIsGasto(gasto);
        setFormData({ tipo: gasto ? 'Pago de Servicios' : 'Ingreso por Donación', descripcion: '', monto: '' });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setFormData({ tipo: '', descripcion: '', monto: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.tipo || !formData.descripcion || !formData.monto) {
            alert('Por favor completa todos los campos.');
            return;
        }

        try {
            await api.post('/transacciones', formData);
            alert('Transacción registrada exitosamente.');
            handleCloseModal();
            fetchData();
        } catch (err) {
            console.error("Error al registrar la transacción:", err);
            alert('No se pudo registrar la transacción.');
        }
    };

    // ========== MODAL DE DESCUENTO ==========
    const handleOpenDescuento = (movimiento) => {
        setMovimientoSeleccionado(movimiento);
        setDescuentoData({ descuento_aplicado: movimiento.descuento_aplicado || 0 });
        setModalDescuentoOpen(true);
    };

    const handleCloseDescuento = () => {
        setModalDescuentoOpen(false);
        setMovimientoSeleccionado(null);
        setDescuentoData({ descuento_aplicado: '' });
    };

    const handleDescuentoChange = (e) => {
        setDescuentoData({ descuento_aplicado: e.target.value });
    };

    const handleDescuentoSubmit = async () => {
        const descuento = parseFloat(descuentoData.descuento_aplicado);
        if (isNaN(descuento) || descuento < 0 || descuento > 100) {
            alert('El descuento debe ser entre 0 y 100%.');
            return;
        }

        try {
            await api.put(`/transacciones/${movimientoSeleccionado.id_movimiento}/descuento`, {
                descuento_aplicado: descuento
            });
            alert('Descuento aplicado exitosamente.');
            handleCloseDescuento();
            fetchData();
        } catch (err) {
            console.error("Error al aplicar descuento:", err);
            alert('No se pudo aplicar el descuento.');
        }
    };

    // ========== MARCAR COMO PAGADO ==========
    const handleMarcarPagado = async (id) => {
        if (!window.confirm('¿Marcar este movimiento como Pagado?')) return;

        try {
            await api.put(`/transacciones/${id}/pagar`);
            alert('Movimiento marcado como Pagado.');
            fetchData();
        } catch (err) {
            console.error("Error al marcar como pagado:", err);
            alert('No se pudo marcar como pagado.');
        }
    };

    // ========== UTILIDADES ==========
    const formatCurrency = (amount) => `Q${parseFloat(amount).toFixed(2)}`;

    const transaccionesFiltradas = data?.transacciones?.filter(t => {
        const cumpleTipo = filtroTipo === 'todos' ||
            (filtroTipo === 'cargos' && t.tipo.startsWith('Cargo')) ||
            (filtroTipo === 'ingresos' && (t.tipo.includes('Ingreso') || t.tipo === 'Pago' || t.tipo.includes('Donación'))) ||
            (filtroTipo === 'gastos' && t.tipo.includes('Gasto'));

        const cumpleEstado = filtroEstado === 'todos' || t.estado_pago === filtroEstado;

        return cumpleTipo && cumpleEstado;
    }) || [];

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Caja y Transacciones
                </Typography>
                {userRole === 'Administración' && (
                    <Box>
                        <Button variant="contained" color="error" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenModal(true)} sx={{ mr: 2 }}>
                            Registrar Gasto
                        </Button>
                        <Button variant="contained" color="success" startIcon={<AddCircleOutlineIcon />} onClick={() => handleOpenModal(false)}>
                            Registrar Ingreso
                        </Button>
                    </Box>
                )}
            </Box>


            {data?.kpis && (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={3}>
                        <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
                            <Typography variant="body2" color="text.secondary">Pendiente de Cobro</Typography>
                            <Typography variant="h5" color="error.main">{formatCurrency(data.kpis.pendienteCobro)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                            <Typography variant="body2" color="text.secondary">Ingresos del Mes</Typography>
                            <Typography variant="h5" color="success.main">{formatCurrency(data.kpis.ingresosDelMes)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                            <Typography variant="body2" color="text.secondary">Gastos del Mes</Typography>
                            <Typography variant="h5" color="warning.main">{formatCurrency(data.kpis.gastosDelMes)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                            <Typography variant="body2" color="text.secondary">Balance del Mes</Typography>
                            <Typography variant="h5" color={parseFloat(data.kpis.balance) >= 0 ? 'success.main' : 'error.main'}>
                                {formatCurrency(data.kpis.balance)}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Filtros */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Tipo</InputLabel>
                    <Select value={filtroTipo} label="Tipo" onChange={(e) => setFiltroTipo(e.target.value)}>
                        <MenuItem value="todos">Todos</MenuItem>
                        <MenuItem value="cargos">Cargos a Pacientes</MenuItem>
                        <MenuItem value="ingresos">Ingresos</MenuItem>
                        <MenuItem value="gastos">Gastos Operativos</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Estado</InputLabel>
                    <Select value={filtroEstado} label="Estado" onChange={(e) => setFiltroEstado(e.target.value)}>
                        <MenuItem value="todos">Todos</MenuItem>
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                        <MenuItem value="Pagado">Pagado</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Tabla */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Responsable</TableCell>
                            <TableCell align="right">Monto Original</TableCell>
                            <TableCell align="right">Descuento</TableCell>
                            <TableCell align="right">Monto Final</TableCell>
                            <TableCell align="center">Estado</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transaccionesFiltradas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">No hay transacciones que coincidan con los filtros</TableCell>
                            </TableRow>
                        ) : (
                            transaccionesFiltradas.map((t) => {
                                const esCargo = t.tipo.startsWith('Cargo');
                                const puedeAplicarDescuento = esCargo && t.estado_pago === 'Pendiente';
                                const puedeMarcarPagado = esCargo && t.estado_pago === 'Pendiente';

                                return (
                                    <TableRow key={t.id_movimiento}>
                                        <TableCell>{new Date(t.fecha).toLocaleDateString('es-GT')}</TableCell>
                                        <TableCell>{t.tipo}</TableCell>
                                        <TableCell>{t.descripcion}</TableCell>
                                        <TableCell>{t.nombre_familiar || t.nombre_donante || '-'}</TableCell>
                                        <TableCell align="right">
                                            {t.monto_original ? formatCurrency(t.monto_original) : '-'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: 'success.main' }}>
                                            {t.descuento_aplicado ? `${t.descuento_aplicado}%` : '-'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color: esCargo ? 'error.main' : 'success.main' }}>
                                            {formatCurrency(t.monto)}
                                        </TableCell>
                                        <TableCell align="center">
                                            {t.estado_pago ? (
                                                <Chip
                                                    label={t.estado_pago}
                                                    color={t.estado_pago === 'Pagado' ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                {/* Fundación y Admin pueden aplicar descuentos */}
                                                {puedeAplicarDescuento && (
                                                    <Tooltip title="Aplicar Descuento">
                                                        <IconButton size="small" color="primary" onClick={() => handleOpenDescuento(t)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                {/* Solo Admin puede marcar como pagado */}
                                                {puedeMarcarPagado && userRole === 'Administración' && (
                                                    <Tooltip title="Marcar como Pagado">
                                                        <IconButton size="small" color="success" onClick={() => handleMarcarPagado(t.id_movimiento)}>
                                                            <CheckCircleIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal Ingreso/Gasto */}
            <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>{isGasto ? 'Registrar Nuevo Gasto' : 'Registrar Nuevo Ingreso'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Tipo de {isGasto ? 'Gasto' : 'Ingreso'}</InputLabel>
                                <Select name="tipo" value={formData.tipo} label="Tipo" onChange={handleChange}>
                                    {isGasto ? (
                                        [
                                            <MenuItem key="pago_serv" value="Pago de Servicios">Pago de Servicios</MenuItem>,
                                            <MenuItem key="gasto_op" value="Gasto Operativo">Gasto Operativo</MenuItem>
                                        ]
                                    ) : (
                                        [
                                            <MenuItem key="dona" value="Ingreso por Donación">Ingreso por Donación</MenuItem>,
                                            <MenuItem key="cuota" value="Ingreso por Cuota Mensual">Ingreso por Cuota Mensual</MenuItem>
                                        ]
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="descripcion" label="Descripción" fullWidth required value={formData.descripcion} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="monto" label="Monto (Q)" type="number" fullWidth required value={formData.monto} onChange={handleChange} inputProps={{ min: 0, step: 0.01 }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal Descuento */}
            <Dialog open={modalDescuentoOpen} onClose={handleCloseDescuento} maxWidth="sm" fullWidth>
                <DialogTitle>Aplicar Descuento</DialogTitle>
                <DialogContent>
                    {movimientoSeleccionado && (
                        <Box sx={{ pt: 1 }}>
                            <Typography variant="body1" gutterBottom><strong>Tipo:</strong> {movimientoSeleccionado.tipo}</Typography>
                            <Typography variant="body1" gutterBottom><strong>Descripción:</strong> {movimientoSeleccionado.descripcion}</Typography>
                            <Typography variant="body1" gutterBottom><strong>Monto Original:</strong> {formatCurrency(movimientoSeleccionado.monto_original || movimientoSeleccionado.monto)}</Typography>

                            <TextField
                                autoFocus
                                margin="dense"
                                label="Descuento (%)"
                                type="number"
                                fullWidth
                                value={descuentoData.descuento_aplicado}
                                onChange={handleDescuentoChange}
                                inputProps={{ min: 0, max: 100, step: 0.1 }}
                                sx={{ mt: 2 }}
                            />

                            {descuentoData.descuento_aplicado && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Monto Final:</Typography>
                                    <Typography variant="h6" color="success.main">
                                        {formatCurrency(
                                            (parseFloat(movimientoSeleccionado.monto_original || movimientoSeleccionado.monto) *
                                                (1 - parseFloat(descuentoData.descuento_aplicado || 0) / 100)).toFixed(2)
                                        )}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDescuento}>Cancelar</Button>
                    <Button onClick={handleDescuentoSubmit} variant="contained">Aplicar Descuento</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TransaccionesPage;