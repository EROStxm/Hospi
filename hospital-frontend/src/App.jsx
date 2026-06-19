import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from './servicios/authService';
import Login from './componentes/autenticacion/Login';
import Dashboard from './paginas/Dashboard';
import RolesPage from './paginas/RolesPage';
import MisSolicitudesPage from './paginas/MisSolicitudesPage';
import Layout from './componentes/comunes/Layout.jsx';
import NuevaSolicitudPage from './paginas/NuevaSolicitudPage';
import TodasSolicitudesPage from './paginas/TodasSolicitudesPage';
import UsuariosPage from './paginas/UsuariosPage';
import MaterialesPage from './paginas/MaterialesPage';
import DetalleSolicitudPage from './paginas/DetalleSolicitudPage';
import UbicacionesPage from './paginas/UbicacionesPage';
import SectoresPage from './paginas/SectoresPage.jsx';
import MisTrabajosPage from './paginas/MisTrabajosPage';
import SolicitudesPendientesPage from './paginas/SolicitudesPendientesPage';
import EquiposPage from './paginas/EquiposPage';
import ParaFirmarPage from './paginas/ParaFirmarPage';
import SolicitudesSectorPage from './paginas/SolicitudesSectorPage';
import NotificacionesPage from './paginas/NotificacionesPage';
import ModalFirma from './componentes/comunes/ModalFirma';
import HuellasPage from './paginas/HuellasPage';
import toast, { Toaster } from 'react-hot-toast';
import './estilos/global.css';

function AppContent() {
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [modalFirmaAbierto, setModalFirmaAbierto] = useState(false);

  // Escuchar evento del Sidebar para abrir el modal de firma
  useEffect(() => {
    const abrirModal = () => setModalFirmaAbierto(true);
    window.addEventListener('abrir-modal-firma', abrirModal);
    return () => window.removeEventListener('abrir-modal-firma', abrirModal);
  }, []);

  useEffect(() => {
    verificarAuth();
  }, []);

  const verificarAuth = () => {
    const estaAuth = authService.estaAutenticado();
    const usuarioGuardado = authService.obtenerUsuarioGuardado();

    console.log('Verificando auth:', { estaAuth, usuarioGuardado });

    setAutenticado(estaAuth);
    setUsuario(usuarioGuardado);
    setCargando(false);
  };

  const manejarLogin = (datosUsuario) => {
    console.log('Login exitoso, actualizando estado');
    setAutenticado(true);
    setUsuario(datosUsuario);
  };

  const manejarLogout = async () => {
    console.log('Cerrando sesión...');
    setCargando(true);

    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setAutenticado(false);
      setUsuario(null);
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  const ProtectedLayout = ({ children }) => (
    <Layout usuario={usuario} onLogout={manejarLogout}>
      {children}
    </Layout>
  );

  return (
    <>
      {/* ===== TOASTER GLOBAL ===== */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e3a5f',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '13px',
          },
        }}
      />

      {/* ===== RUTAS ===== */}
      <Routes>
        <Route
          path="/login"
          element={
            autenticado ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLoginSuccess={manejarLogin} />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            autenticado ? (
              <ProtectedLayout>
                <Dashboard usuario={usuario} />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/roles"
          element={
            autenticado ? (
              <ProtectedLayout>
                <RolesPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/mis-solicitudes"
          element={
            autenticado ? (
              <ProtectedLayout>
                <MisSolicitudesPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/solicitudes"
          element={
            autenticado ? (
              <ProtectedLayout>
                <TodasSolicitudesPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/nueva-solicitud"
          element={
            autenticado ? (
              <ProtectedLayout>
                <NuevaSolicitudPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/equipos"
          element={
            autenticado ? (
              <ProtectedLayout>
                <EquiposPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/usuarios"
          element={
            autenticado ? (
              <ProtectedLayout>
                <UsuariosPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/materiales"
          element={
            autenticado ? (
              <ProtectedLayout>
                <MaterialesPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/solicitudes/:id"
          element={
            autenticado ? (
              <ProtectedLayout>
                <DetalleSolicitudPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/ubicaciones"
          element={
            autenticado ? (
              <ProtectedLayout>
                <UbicacionesPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/sectores"
          element={
            autenticado ? (
              <ProtectedLayout>
                <SectoresPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/mis-asignaciones"
          element={
            autenticado ? (
              <ProtectedLayout>
                <MisTrabajosPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/solicitudes-pendientes"
          element={
            autenticado ? (
              <ProtectedLayout>
                <SolicitudesPendientesPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/para-firmar"
          element={
            autenticado ? (
              <ProtectedLayout>
                <ParaFirmarPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/solicitudes-sector"
          element={
            autenticado ? (
              <ProtectedLayout>
                <SolicitudesSectorPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/notificaciones"
          element={
            autenticado ? (
              <ProtectedLayout>
                <NotificacionesPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/huellas"
          element={
            autenticado && usuario?.rol?.nombre === 'admin_sistema' ? (
              <ProtectedLayout>
                <HuellasPage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route
          path="/"
          element={<Navigate to={autenticado ? "/dashboard" : "/login"} replace />}
        />
      </Routes>

      {/* ===== MODAL DE FIRMA DIGITAL (GLOBAL) ===== */}
      {modalFirmaAbierto && (
        <ModalFirma
          onClose={() => setModalFirmaAbierto(false)}
          onFirmaLista={(firmaData) => {
            console.log('✅ Firma registrada correctamente');
            setModalFirmaAbierto(false);
            toast.success('✅ Firma digital lista para usar');
          }}
        />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;