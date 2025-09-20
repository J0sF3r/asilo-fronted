import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../utils/api';

const FarmaciaPage = () => {
    const [pendientes, setPendientes] = useState([]);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedMedicamento, setSelectedMedicamento] = useState(null);

    const fetchPendientes = async () => {
        try {
            const res = await api.get('/farmacia/pendientes');
            setPendientes(res.data);
        } catch (err) {
            console.error("Error al obtener recetas pendientes:", err);
        }
    };

    useEffect(() => {
        fetchPendientes();
    }, []);

    const handleOpenConfirmModal = (medicamento) => {
        setSelectedMedicamento(medicamento);
        setConfirmModalOpen(true);
    };

    const handleCloseConfirmModal = () => {
        setConfirmModalOpen(false);
        setSelectedMedicamento(null);
    };

    const handleConfirmEntrega = async () => {
        if (!selectedMedicamento) return;
        try {
            const body = {
                id_visita: selectedMedicamento.id_visita,
                id_medicamento: selectedMedicamento.id_medicamento
            };
            await api.put('/farmacia/entregar', body);
            handleCloseConfirmModal();
            fetchPendientes(); // Refrescar la lista
            alert('Entrega registrada exitosamente.');
        } catch (err) {
            console.error("Error al registrar la entrega:", err);
            alert(err.response?.data?.msg || 'No se pudo registrar la entrega.');
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <Paper sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
                    Portal de Farmacia - Recetas Pendientes
                </Typography>
                
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Paciente</TableCell>
                                <TableCell>Medicamento</TableCell>
                                <TableCell>Cantidad</TableCell>
                                <TableCell>Indicaciones</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendientes.length > 0 ? pendientes.map((med) => (
                                <TableRow key={`${med.id_visita}-${med.id_medicamento}`}>
                                    <TableCell>{med.nombre_paciente}</TableCell>
                                    <TableCell>{med.nombre_medicamento}</TableCell>
                                    <TableCell>{med.cantidad}</TableCell>
                                    <TableCell>{med.indicaciones}</TableCell>
                                    <TableCell align="right">
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            startIcon={<CheckCircleIcon />}
                                            onClick={() => handleOpenConfirmModal(med)}
                                        >
                                            Registrar Entrega
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No hay recetas pendientes de entrega.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Modal de Confirmación */}
            <Dialog open={confirmModalOpen} onClose={handleCloseConfirmModal}>
                <DialogTitle>Confirmar Entrega de Medicamento</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que quieres registrar la entrega de <strong>{selectedMedicamento?.cantidad}x {selectedMedicamento?.nombre_medicamento}</strong> al paciente <strong>{selectedMedicamento?.nombre_paciente}</strong>? Esta acción añadirá el costo al cobro total de la visita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmModal}>Cancelar</Button>
                    <Button onClick={handleConfirmEntrega} variant="contained" autoFocus>
                        Confirmar Entrega
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FarmaciaPage;