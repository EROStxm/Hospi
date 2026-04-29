// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MisSolicitudesScreen } from '../screens/MisSolicitudesScreen';
import { NuevaSolicitudScreen } from '../screens/NuevaSolicitudScreen';
import { DetalleSolicitudScreen } from '../screens/DetalleSolicitudScreen';
import { FirmarSolicitudScreen } from '../screens/FirmarSolicitudScreen';
import { EscanerQRScreen } from '../screens/EscanerQRScreen';
import { PendientesSoporteScreen } from '../screens/PendientesSoporteScreen';
import { AdminPanelScreen } from '../screens/AdminPanelScreen';
import { EquiposScreen } from '../screens/EquiposScreen';
import { MaterialesScreen } from '../screens/MaterialesScreen';
import { EstadisticasScreen } from '../screens/EstadisticasScreen';

const Stack = createStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerBackTitle: 'Atrás' }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Inicio' }} />
      <Stack.Screen name="MisSolicitudes" component={MisSolicitudesScreen} options={{ title: 'Mis Solicitudes' }} />
      <Stack.Screen name="NuevaSolicitud" component={NuevaSolicitudScreen} options={{ title: 'Nueva Solicitud' }} />
      <Stack.Screen name="DetalleSolicitud" component={DetalleSolicitudScreen} options={{ title: 'Detalle de Solicitud' }} />
      <Stack.Screen name="FirmarSolicitud" component={FirmarSolicitudScreen} options={{ title: 'Firmar Solicitud' }} />
      <Stack.Screen name="EscanerQR" component={EscanerQRScreen} options={{ title: 'Escanear QR' }} />
      <Stack.Screen name="PendientesSoporte" component={PendientesSoporteScreen} options={{ title: 'Pendientes Soporte' }} />
      <Stack.Screen name="AdminPanel" component={AdminPanelScreen} options={{ title: 'Panel de Administración' }} />
      <Stack.Screen name="Equipos" component={EquiposScreen} options={{ title: 'Equipos' }} />
      <Stack.Screen name="Materiales" component={MaterialesScreen} options={{ title: 'Materiales' }} />
      <Stack.Screen name="Estadisticas" component={EstadisticasScreen} options={{ title: 'Estadísticas' }} />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};