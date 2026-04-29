// src/screens/AdminPanelScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { solicitudService } from '../services/solicitudService';
import { equipoService } from '../services/equipoService';
import { materialService } from '../services/materialService';
import { authService } from '../services/authService';
import { huellaService } from '../services/huellaService';

export const AdminPanelScreen = ({ navigation }: any) => {
  const [stats, setStats] = useState({
    totalSolicitudes: 0,
    totalEquipos: 0,
    totalMateriales: 0,
    totalUsuarios: 0,
    huellasRegistradas: 0,
    stockBajo: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [espOnline, setEspOnline] = useState(false);
  const [memoriaSensor, setMemoriaSensor] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar estadísticas
      const solicitudes = await solicitudService.getAll({ limit: 1 });
      const equipos = await equipoService.getAll();
      const materiales = await materialService.getAll();
      const usuarios = await authService.getUser();
      const huellas = await huellaService.obtenerUsuariosConHuella();
      const stockBajo = await materialService.getStockBajo();
      const espInfo = await huellaService.getInfoSensor();
      
      setStats({
        totalSolicitudes: solicitudes.total || 0,
        totalEquipos: equipos.data?.length || 0,
        totalMateriales: materiales.data?.length || 0,
        totalUsuarios: 0, // Se obtendría de usuariosService
        huellasRegistradas: huellas.data?.length || 0,
        stockBajo: stockBajo.data?.length || 0,
      });
      
      setMemoriaSensor(espInfo.huellas_memoria || 0);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkESP32 = async () => {
    const online = await huellaService.verificarESP32();
    setEspOnline(online);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    await checkESP32();
    setRefreshing(false);
  }, []);

  const limpiarSensorESP32 = async () => {
    Alert.alert(
      'Limpiar Sensor',
      '¿Estás seguro? Esto eliminará TODAS las huellas almacenadas en el sensor AS608.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            const success = await huellaService.limpiarSensor();
            if (success) {
              Alert.alert('Éxito', 'Memoria del sensor limpiada');
              await loadData();
            } else {
              Alert.alert('Error', 'No se pudo limpiar el sensor');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: '👥', title: 'Usuarios', route: 'Usuarios', color: '#1a56db' },
    { icon: '🖥️', title: 'Equipos', route: 'Equipos', color: '#10b981' },
    { icon: '📦', title: 'Materiales', route: 'Materiales', color: '#f59e0b' },
    { icon: '🏥', title: 'Sectores', route: 'Sectores', color: '#8b5cf6' },
    { icon: '📍', title: 'Ubicaciones', route: 'Ubicaciones', color: '#ec4898' },
    { icon: '📋', title: 'Categorías Equipos', route: 'Categorias', color: '#06b6d4' },
    { icon: '👔', title: 'Roles', route: 'Roles', color: '#ef4444' },
    { icon: '🖐️', title: 'Gestión Huellas', route: 'Huellas', color: '#1a56db' },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
        <View style={[styles.espStatus, espOnline ? styles.espOnline : styles.espOffline]}>
          <Text style={styles.espStatusText}>
            {espOnline ? '🟢 Sensor AS608 conectado' : '🔴 Sensor AS608 desconectado'}
          </Text>
        </View>
      </View>

      {/* Tarjetas de estadísticas */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalSolicitudes}</Text>
          <Text style={styles.statLabel}>Solicitudes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalEquipos}</Text>
          <Text style={styles.statLabel}>Equipos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalMateriales}</Text>
          <Text style={styles.statLabel}>Materiales</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.huellasRegistradas}</Text>
          <Text style={styles.statLabel}>Huellas</Text>
        </View>
        <View style={[styles.statCard, styles.warningCard]}>
          <Text style={styles.statNumber}>{stats.stockBajo}</Text>
          <Text style={styles.statLabel}>Stock Bajo</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{memoriaSensor}/127</Text>
          <Text style={styles.statLabel}>Memoria Sensor</Text>
        </View>
      </View>

      {/* Botón de limpiar sensor */}
      {espOnline && (
        <TouchableOpacity style={styles.clearSensorButton} onPress={limpiarSensorESP32}>
          <Text style={styles.clearSensorText}>🗑️ Limpiar Memoria del Sensor AS608</Text>
        </TouchableOpacity>
      )}

      {/* Menú de administración */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Gestión del Sistema</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuText}>{item.title}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#1a56db', padding: 20, paddingTop: 40 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  espStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  espOnline: { backgroundColor: '#10b981' },
  espOffline: { backgroundColor: '#ef4444' },
  espStatusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  statCard: { flex: 1, minWidth: '28%', backgroundColor: '#fff', borderRadius: 12, padding: 15, alignItems: 'center', elevation: 2 },
  warningCard: { backgroundColor: '#fffbeb' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 5, textAlign: 'center' },
  clearSensorButton: { backgroundColor: '#ef4444', margin: 15, marginTop: 5, padding: 14, borderRadius: 10, alignItems: 'center' },
  clearSensorText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  menuContainer: { backgroundColor: '#fff', margin: 15, borderRadius: 12, padding: 15, elevation: 2 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuIcon: { fontSize: 22, marginRight: 15, width: 40 },
  menuText: { flex: 1, fontSize: 15, color: '#333' },
  menuArrow: { fontSize: 18, color: '#ccc' },
});