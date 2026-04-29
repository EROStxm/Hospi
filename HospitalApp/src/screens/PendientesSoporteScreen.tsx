// src/screens/PendientesSoporteScreen.tsx
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

export const PendientesSoporteScreen = ({ navigation }: any) => {
  const [solicitudes, setSolicitudes] = useState([]);
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
      
      const response = await solicitudService.getPendientesSoporte();
      setSolicitudes(response.data || []);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleAsignar = async (solicitudId: number) => {
    Alert.alert(
      'Asignar Solicitud',
      '¿Te asignas esta solicitud?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Asignarme',
          onPress: async () => {
            try {
              await solicitudService.asignarTecnico(solicitudId, user?.id);
              Alert.alert('Éxito', 'Solicitud asignada correctamente');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'No se pudo asignar la solicitud');
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (estado: string) => {
    if (estado === 'pendiente_soporte') return '#f59e0b';
    if (estado === 'asignado') return '#10b981';
    return '#6b7280';
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
      keyExtractor={(item: any) => item.id.toString()}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
        </View>
      }
      renderItem={({ item }: any) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('DetalleSolicitud', { id: item.id })}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardId}>#{item.id}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.estado) + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(item.estado) }]}>
                {item.estado === 'pendiente_soporte' ? 'Pendiente' : 'Asignada'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.cardTitle}>{item.titulo}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.descripcion}
          </Text>
          
          <Text style={styles.cardInfo}>
            📍 {item.sector?.nombre || 'Sin sector'} | 🖥️ {item.equipo?.nombre || 'Sin equipo'}
          </Text>
          
          <Text style={styles.cardDate}>
            Creada: {new Date(item.creado_en).toLocaleDateString('es-ES')}
          </Text>

          {item.estado === 'pendiente_soporte' && (
            <TouchableOpacity
              style={styles.assignButton}
              onPress={() => handleAsignar(item.id)}
            >
              <Text style={styles.assignButtonText}>Asignarme</Text>
            </TouchableOpacity>
          )}
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
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  priorityText: { fontSize: 11, fontWeight: '500' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#666', marginBottom: 10, lineHeight: 18 },
  cardInfo: { fontSize: 12, color: '#888', marginBottom: 5 },
  cardDate: { fontSize: 11, color: '#999', marginBottom: 12 },
  assignButton: { backgroundColor: '#10b981', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  assignButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 14 },
});