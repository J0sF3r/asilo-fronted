// src/components/menuItems.js
import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ScienceIcon from '@mui/icons-material/Science';
import MedicationIcon from '@mui/icons-material/Medication';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WcIcon from '@mui/icons-material/Wc';
import EscalatorWarningIcon from '@mui/icons-material/EscalatorWarning';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';

const allMenuItems = [
    {
        text: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardIcon />,
        allowedRoles: ['Administración']
    },
    {
        text: 'Solicitudes Médicas',
        path: '/solicitudes',
        icon: <AssignmentIcon />,
        allowedRoles: ['Administración', 'Medico General', 'Fundación', ]
    },
    {
        text: 'Agenda de Citas',
        path: '/agenda-citas',
        icon: <EventNoteIcon />,
        allowedRoles: ['Administración', 'Fundación', 'Medico Especialista']
    },
    {
        text: 'Gestionar Pacientes',
        path: '/pacientes',
        icon: <PeopleIcon />,
        allowedRoles: ['Administración', 'Medico General']
    },
    {
        text: 'Familiares',
        path: '/familiares',
        icon: <WcIcon />,
        allowedRoles: ['Administración']
    },
    {
        text: 'Médicos',
        path: '/medicos',
        icon: <LocalHospitalIcon />,
        allowedRoles: ['Administración']
    },
    {
        text: 'Enfermeros',
        path: '/enfermeros',
        icon: <EscalatorWarningIcon />,
        allowedRoles: ['Administración']
    },
    {
        text: 'Portal Laboratorio',
        path: '/laboratorio',
        icon: <ScienceIcon />,
        allowedRoles: ['Laboratorio', 'Administración'] 
    },
    {
        text: 'Portal Farmacia',
        path: '/farmacia',
        icon: <MedicationIcon />,
        allowedRoles: ['Farmacia', 'Administración'] 
    },
    {
        text: 'Exámenes Médicos',
        path: '/examenes',
        icon: <ScienceIcon />,
        allowedRoles: ['Administración']
    },
    {
        text: 'Medicamentos',
        path: '/medicamentos',
        icon: <MedicationIcon />,
        allowedRoles: ['Administración']
    },
    {
        text: 'Administrar Usuarios',
        path: '/usuarios',
        icon: <AdminPanelSettingsIcon />,
        allowedRoles: ['Administración']
    },
    {
    text: 'Caja y Transacciones',
    path: '/transacciones',
    icon: <PointOfSaleIcon />, 
    allowedRoles: ['Administración']
},


];

export default allMenuItems;