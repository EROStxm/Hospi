// src/screens/MisSolicitudesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { solicitudService } from '../services/solicitudService';
import { authService } from '../services/authService';

interface Solicitud {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  creado_en: string;
  equipo?: { nombre: string };
  sector?: { nombre: string };
  solicitante?: { nombre_completo: string };
}

export const MisSolicitudesScreen = ({ navigation }: any) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
      
      const response = await solicitudService.getMisSolicitudes();
      setSolicitudes(response.data || []);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar tus solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const getStatusColor = (estado: string): string => {
    const colors: Record<string, string> = {
      pendiente_solicitante: '#f59e0b',
      pendiente_jefe_seccion: '#8b5cf6',
      pendiente_jefe_activos: '#ec4898',
      pendiente_soporte: '#3b82f6',
      asignado: '#10b981',
      en_proceso: '#06b6d4',
      pendiente_conformacion: '#84cc16',
      pendiente_jefe_mantenimiento: '#f97316',
      completado: '#6b7280',
      rechazado: '#ef4444',
      archivado: '#9ca3af',
    };
    return colors[estado] || '#6b7280';
  };

  const getStatusText = (estado: string): string => {
    const texts: Record<string, string> = {
      pendiente_solicitante: 'Pendiente',
      pendiente_jefe_seccion: 'En revisión',
      pendiente_jefe_activos: 'Revisión Activos',
      pendiente_soporte: 'En soporte',
      asignado: 'Asignada',
      en_proceso: 'En proceso',
      pendiente_conformacion: 'Conformación',
      pendiente_jefe_mantenimiento: 'Rev. Mantenimiento',
      completado: 'Completada',
      rechazado: 'Rechazada',
      archivado: 'Archivada',
    };
    return texts[estado] || estado;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={solicitudes}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No tienes solicitudes</Text>
          <TouchableOpacity
            style={styles.newButton}
            onPress={() => navigation.navigate('NuevaSolicitud')}
          >
            <Text style={styles.newButtonText}>➕ Crear Solicitud</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('DetalleSolicitud', { id: item.id })}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardId}>#{item.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.estado) }]}>
                {getStatusText(item.estado)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.cardTitle}>{item.titulo || 'Sin título'}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.descripcion || 'Sin descripción'}
          </Text>
          
          <Text style={styles.cardDate}>
            {item.creado_en ? new Date(item.creado_en).toLocaleDateString('es-ES') : ''}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardId: { fontSize: 14, fontWeight: 'bold', color: '#1a56db' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '500' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#666', marginBottom: 10, lineHeight: 18 },
  cardDate: { fontSize: 11, color: '#999' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 14, marginBottom: 15 },
  newButton: { backgroundColor: '#1a56db', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  newButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});