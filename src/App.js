// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

// Importaciones de páginas y componentes
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import PacientesPage from './pages/PacientesPage';
import FamiliaresPage from './pages/FamiliaresPage';
import PacienteDetailPage from './pages/PacienteDetailPage';
import MedicosPage from './pages/MedicosPage';
import EnfermerosPage from './pages/EnfermerosPage';
import SolicitudesPage from './pages/SolicitudesPage';
import AgendaCitasPage from './pages/AgendaCitasPage';
import ExamenesPage from './pages/ExamenesPage';
import LaboratorioPage from './pages/LaboratorioPage';
import MedicamentosPage from './pages/MedicamentosPage';
import FarmaciaPage from './pages/FarmaciaPage';
import TransaccionesPage from './pages/TransaccionesPage';
import EstadoCuentaPage from './pages/EstadoCuentaPage';
import CuotasPage from './pages/CuotasPage';
import DonantesPage from './pages/DonantesPage';

import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        {/* Ruta Pública: Solo para el login */}
        <Route path="/login" element={<LoginPage />} />

        {/* --- Rutas Protegidas --- */}
        {/* Ruta para el Panel Principal */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Ruta para la Administración de Usuarios */}
        <Route path="/usuarios" element={
          <ProtectedRoute><MainLayout><UsersPage /></MainLayout> </ProtectedRoute>
        } />
        <Route path="/pacientes" element={
          <ProtectedRoute> <MainLayout> <PacientesPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/familiares" element={
          <ProtectedRoute> <MainLayout> <FamiliaresPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/pacientes/:id" element={
          <ProtectedRoute> <MainLayout> <PacienteDetailPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/medicos" element={
          <ProtectedRoute> <MainLayout> <MedicosPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/enfermeros" element={
          <ProtectedRoute> <MainLayout> <EnfermerosPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/solicitudes" element={
          <ProtectedRoute> <MainLayout> <SolicitudesPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/agenda-citas" element={
          <ProtectedRoute> <MainLayout> <AgendaCitasPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/examenes" element={
          <ProtectedRoute> <MainLayout> <ExamenesPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/laboratorio" element={
          <ProtectedRoute> <MainLayout> <LaboratorioPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/medicamentos" element={
          <ProtectedRoute> <MainLayout> <MedicamentosPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/farmacia" element={
          <ProtectedRoute> <MainLayout> <FarmaciaPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/transacciones" element={
          <ProtectedRoute> <MainLayout> <TransaccionesPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/familiares/:id/estado-de-cuenta" element={
          <ProtectedRoute> <MainLayout> <EstadoCuentaPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/cuotas" element={
          <ProtectedRoute> <MainLayout> <CuotasPage /> </MainLayout> </ProtectedRoute>
        } />
        <Route path="/donantes" element={
          <ProtectedRoute> <MainLayout> <DonantesPage /> </MainLayout> </ProtectedRoute>
        } />
      </Routes>
    </ThemeProvider>
  );
}

export default App;