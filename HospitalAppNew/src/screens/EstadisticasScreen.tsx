// src/screens/EstadisticasScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { solicitudService } from '../services/solicitudService';
import { equipoService } from '../services/equipoService';
import { materialService } from '../services/materialService';
import { huellaService } from '../services/huellaService';

// Definir tipos
interface SolicitudStats {
  total: number;
  pendientes: number;
  completadas: number;
  rechazadas: number;
}

interface EquipoStats {
  total: number;
  operativos: number;
  mantenimiento: number;
  averiados: number;
}

interface MaterialStats {
  total: number;
  stockBajo: number;
  valorTotal: number;
}

interface HuellaStats {
  registradas: number;
  capacidadSensor: number;
  memoriaSensor: number;
}

interface UsuarioStats {
  total: number;
  activos: number;
}

interface EquipoData {
  estado: string;
}

interface MaterialData {
  costo_unitario: number | null;
  stock: number;
}

interface EstadisticasData {
  pendientes: number;
  completadas: number;
  rechazadas: number;
}

export const EstadisticasScreen = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudStats>({
    total: 0,
    pendientes: 0,
    completadas: 0,
    rechazadas: 0,
  });
  const [equipos, setEquipos] = useState<EquipoStats>({
    total: 0,
    operativos: 0,
    mantenimiento: 0,
    averiados: 0,
  });
  const [materiales, setMateriales] = useState<MaterialStats>({
    total: 0,
    stockBajo: 0,
    valorTotal: 0,
  });
  const [huellas, setHuellas] = useState<HuellaStats>({
    registradas: 0,
    capacidadSensor: 127,
    memoriaSensor: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Solicitudes
      const solicitudesRes = await solicitudService.getAll();
      const estadisticasRes = await solicitudService.getEstadisticas() as EstadisticasData;
      
      setSolicitudes({
        total: solicitudesRes.total || 0,
        pendientes: estadisticasRes?.pendientes || 0,
        completadas: estadisticasRes?.completadas || 0,
        rechazadas: estadisticasRes?.rechazadas || 0,
      });
      
      // Equipos
      const equiposRes = await equipoService.getAll();
      const equiposData = (equiposRes.data || []) as EquipoData[];
      
      setEquipos({
        total: equiposData.length,
        operativos: equiposData.filter((e: EquipoData) => e.estado === 'operativo').length,
        mantenimiento: equiposData.filter((e: EquipoData) => e.estado === 'mantenimiento').length,
        averiados: equiposData.filter((e: EquipoData) => e.estado === 'averiado').length,
      });
      
      // Materiales
      const materialesRes = await materialService.getAll();
      const materialesData = (materialesRes.data || []) as MaterialData[];
      const stockBajoRes = await materialService.getStockBajo();
      
      const valorTotal = materialesData.reduce((sum: number, m: MaterialData) => {
        return sum + ((m.costo_unitario || 0) * m.stock);
      }, 0);
      
      setMateriales({
        total: materialesData.length,
        stockBajo: stockBajoRes.data?.length || 0,
        valorTotal: valorTotal,
      });
      
      // Huellas
      const huellasRes = await huellaService.obtenerUsuariosConHuella();
      const infoSensor = await huellaService.getInfoSensor();
      
      setHuellas({
        registradas: huellasRes.data?.length || 0,
        capacidadSensor: 127,
        memoriaSensor: infoSensor.huellas_memoria || 0,
      });
      
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

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
      {/* Solicitudes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Solicitudes</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{solicitudes.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, styles.pendingCard]}>
            <Text style={styles.statNumber}>{solicitudes.pendientes}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={[styles.statCard, styles.completedCard]}>
            <Text style={styles.statNumber}>{solicitudes.completadas}</Text>
            <Text style={styles.statLabel}>Completadas</Text>
          </View>
          <View style={[styles.statCard, styles.rejectedCard]}>
            <Text style={styles.statNumber}>{solicitudes.rechazadas}</Text>
            <Text style={styles.statLabel}>Rechazadas</Text>
          </View>
        </View>
      </View>

      {/* Equipos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🖥️ Equipos</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{equipos.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
            <Text style={styles.statNumber}>{equipos.operativos}</Text>
            <Text style={styles.statLabel}>Operativos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fed7aa' }]}>
            <Text style={styles.statNumber}>{equipos.mantenimiento}</Text>
            <Text style={styles.statLabel}>Mantenimiento</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
            <Text style={styles.statNumber}>{equipos.averiados}</Text>
            <Text style={styles.statLabel}>Averiados</Text>
          </View>
        </View>
      </View>

      {/* Materiales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Materiales</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{materiales.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, styles.warningCard]}>
            <Text style={styles.statNumber}>{materiales.stockBajo}</Text>
            <Text style={styles.statLabel}>Stock Bajo</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>S/ {materiales.valorTotal.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Valor Inventario</Text>
          </View>
        </View>
      </View>

      {/* Huellas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🖐️ Huellas Digitales</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{huellas.registradas}</Text>
            <Text style={styles.statLabel}>Usuarios con huella</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{huellas.memoriaSensor}/{huellas.capacidadSensor}</Text>
            <Text style={styles.statLabel}>Sensor AS608</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { backgroundColor: '#fff', margin: 15, marginBottom: 0, borderRadius: 12, padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#f8fafc', borderRadius: 10, padding: 15, alignItems: 'center' },
  pendingCard: { backgroundColor: '#fffbeb' },
  completedCard: { backgroundColor: '#ecfdf5' },
  rejectedCard: { backgroundColor: '#fef2f2' },
  warningCard: { backgroundColor: '#fffbeb' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 5, textAlign: 'center' },
});