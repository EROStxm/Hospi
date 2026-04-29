import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { authService } from '../services/authService';
import { solicitudService } from '../services/solicitudService';
import { huellaService } from '../services/huellaService';

export const DashboardScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    misSolicitudes: 0,
    pendientes: 0,
    completadas: 0,
    paraFirmar: 0,
    pendientesSoporte: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [espOnline, setEspOnline] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await authService.getUser();
    setUser(userData);
    await loadStats(userData);
    await checkESP32();
  };

  const loadStats = async (userData: any) => {
    try {
      const misSolicitudes = await solicitudService.getMisSolicitudes();
      const estadisticas = await solicitudService.getEstadisticas();
      
      setStats({
        misSolicitudes: misSolicitudes.data?.length || 0,
        pendientes: estadisticas.pendientes || 0,
        completadas: estadisticas.completadas || 0,
        paraFirmar: 0,
        pendientesSoporte: 0,
      });

      if (userData?.rol?.nombre === 'jefe_servicio') {
        const paraFirmar = await solicitudService.getParaFirmar();
        setStats(prev => ({ ...prev, paraFirmar: paraFirmar.data?.length || 0 }));
      }
      
      if (['soporte_tecnico', 'jefe_soporte'].includes(userData?.rol?.nombre)) {
        const pendientes = await solicitudService.getPendientesSoporte();
        setStats(prev => ({ ...prev, pendientesSoporte: pendientes.data?.length || 0 }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const checkESP32 = async () => {
    const online = await huellaService.verificarESP32();
    setEspOnline(online);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const menuItems = [
    { icon: '📋', title: 'Mis Solicitudes', route: 'MisSolicitudes', roles: ['*'] },
    { icon: '➕', title: 'Nueva Solicitud', route: 'NuevaSolicitud', roles: ['*'] },
    { icon: '✍️', title: 'Para Firmar', route: 'ParaFirmar', roles: ['jefe_servicio'], badge: stats.paraFirmar },
    { icon: '🔧', title: 'Pendientes Soporte', route: 'PendientesSoporte', roles: ['soporte_tecnico', 'jefe_soporte'], badge: stats.pendientesSoporte },
    { icon: '🔍', title: 'Escanear QR', route: 'EscanerQR', roles: ['*'] },
    { icon: '🖐️', title: 'Gestión Huellas', route: 'Huellas', roles: ['admin_sistema'] },
    { icon: '📦', title: 'Materiales', route: 'Materiales', roles: ['admin_sistema', 'jefe_soporte'] },
    { icon: '🖥️', title: 'Equipos', route: 'Equipos', roles: ['*'] },
    { icon: '📊', title: 'Estadísticas', route: 'Estadisticas', roles: ['admin_sistema'] },
    { icon: '⚙️', title: 'Admin Panel', route: 'AdminPanel', roles: ['admin_sistema'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes('*') || item.roles.includes(user?.rol?.nombre)
  );

  const getRolNombre = (rol: string) => {
    const roles: Record<string, string> = {
      admin_sistema: 'Administrador',
      jefe_soporte: 'Jefe de Soporte',
      soporte_tecnico: 'Soporte Técnico',
      jefe_servicio: 'Jefe de Servicio',
    };
    return roles[rol] || rol;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>Bienvenido,</Text>
        <Text style={styles.userName}>{user?.nombre_completo || 'Usuario'}</Text>
        <Text style={styles.userRole}>{getRolNombre(user?.rol?.nombre)}</Text>
        <View style={[styles.espStatus, espOnline ? styles.espOnline : styles.espOffline]}>
          <Text style={styles.espStatusText}>
            {espOnline ? '🟢 Sensor AS608 conectado' : '🔴 Sensor AS608 desconectado'}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.misSolicitudes}</Text>
          <Text style={styles.statLabel}>Mis Solicitudes</Text>
        </View>
        <View style={[styles.statCard, styles.pendingCard]}>
          <Text style={styles.statNumber}>{stats.pendientes}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={[styles.statCard, styles.completedCard]}>
          <Text style={styles.statNumber}>{stats.completadas}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Menú Principal</Text>
        {filteredMenu.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuText}>{item.title}</Text>
            {/* Cambia esta línea */}
            {item.badge !== undefined && item.badge > 0 && (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
            )}
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          Alert.alert('Cerrar Sesión', '¿Deseas cerrar sesión?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salir', onPress: async () => {
              await authService.logout();
              navigation.replace('Login');
            }},
          ]);
        }}
      >
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Hospital Militar - Sistema de Mantenimiento v1.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a56db', padding: 20, paddingTop: 40 },
  welcome: { color: '#fff', fontSize: 14, opacity: 0.8 },
  userName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  userRole: { color: '#fff', fontSize: 14, marginTop: 5, opacity: 0.9 },
  espStatus: { marginTop: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  espOnline: { backgroundColor: '#10b981' },
  espOffline: { backgroundColor: '#ef4444' },
  espStatusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', padding: 15, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 15, alignItems: 'center', elevation: 2 },
  pendingCard: { backgroundColor: '#fffbeb' },
  completedCard: { backgroundColor: '#ecfdf5' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 5, textAlign: 'center' },
  menuContainer: { backgroundColor: '#fff', margin: 15, borderRadius: 12, padding: 15, elevation: 2 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuIcon: { fontSize: 22, marginRight: 15, width: 40 },
  menuText: { flex: 1, fontSize: 15, color: '#333' },
  menuArrow: { fontSize: 18, color: '#ccc' },
  badge: { backgroundColor: '#ef4444', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginRight: 10 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  logoutButton: { margin: 15, marginTop: 5, padding: 14, backgroundColor: '#fee2e2', borderRadius: 10, alignItems: 'center' },
  logoutText: { color: '#dc2626', fontSize: 14, fontWeight: '500' },
  version: { textAlign: 'center', color: '#999', fontSize: 10, marginBottom: 20 },
});