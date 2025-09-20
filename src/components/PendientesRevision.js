// src/components/PendientesRevision.js
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Box, Paper, List, ListItem, ListItemText, Button, Divider, Chip } from '@mui/material';
import api from '../utils/api';

const PendientesRevision = () => {
    const [pendientes, setPendientes] = useState([]);

    useEffect(() => {
        const fetchPendientes = async () => {
            try {
                const res = await api.get('/visitas/pendientes-revision');
                setPendientes(res.data);
            } catch (err) {
                console.error("Error al obtener visitas pendientes de revisión:", err);
            }
        };
        fetchPendientes();
    }, []);

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-GT');

    // Si no hay pendientes, no mostramos nada.
    if (pendientes.length === 0) {
        return null;
    }

    return (
        <Paper sx={{ p: 2, mb: 4, backgroundColor: '#fffbe6' }}>
            <Typography variant="h6" component="h2" gutterBottom>
                Resultados Pendientes de Revisión
            </Typography>
            <List dense>
                {pendientes.map((visita, index) => (
                    <React.Fragment key={visita.id_visita}>
                        <ListItem
                            secondaryAction={
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    component={RouterLink} 
                                    to="/agenda-citas"
                                >
                                    Ir a la Agenda
                                </Button>
                            }
                        >
                            <ListItemText
                                primary={`El paciente ${visita.nombre_paciente} tiene resultados listos.`}
                                secondary={`Fecha de la visita: ${formatDate(visita.fecha_visita)}`}
                            />
                        </ListItem>
                        {index < pendientes.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
};

export default PendientesRevision;