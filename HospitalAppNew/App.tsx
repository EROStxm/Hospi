// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

// Importar todas las pantallas
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MisSolicitudesScreen } from './src/screens/MisSolicitudesScreen';
import { NuevaSolicitudScreen } from './src/screens/NuevaSolicitudScreen';
import { DetalleSolicitudScreen } from './src/screens/DetalleSolicitudScreen';
import { FirmarSolicitudScreen } from './src/screens/FirmarSolicitudScreen';
import { EscanerQRScreen } from './src/screens/EscanerQRScreen';
import { PendientesSoporteScreen } from './src/screens/PendientesSoporteScreen';
import { AdminPanelScreen } from './src/screens/AdminPanelScreen';
import { EquiposScreen } from './src/screens/EquiposScreen';
import { MaterialesScreen } from './src/screens/MaterialesScreen';
import { EstadisticasScreen } from './src/screens/EstadisticasScreen';

const Stack = createStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerBackTitle: 'Atrás' }}>
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
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainStack} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}