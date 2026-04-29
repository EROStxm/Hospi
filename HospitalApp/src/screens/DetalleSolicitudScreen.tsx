// src/screens/DetalleSolicitudScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Share,
} from 'react-native';
import { solicitudService } from '../services/solicitudService';
import { authService } from '../services/authService';

export const DetalleSolicitudScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [solicitud, setSolicitud] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
      
      const response = await solicitudService.getById(id);
      setSolicitud(response.data);
      setPdfUrl(solicitudService.getPDFUrl(id));
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudo cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado: string) => {
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

  const getStatusText = (estado: string) => {
    const texts: Record<string, string> = {
      pendiente_solicitante: 'Pendiente del Solicitante',
      pendiente_jefe_seccion: 'Pendiente del Jefe de Sección',
      pendiente_jefe_activos: 'Pendiente del Jefe de Activos',
      pendiente_soporte: 'Pendiente de Soporte',
      asignado: 'Asignada a Técnico',
      en_proceso: 'En Proceso',
      pendiente_conformacion: 'Pendiente de Conformación',
      pendiente_jefe_mantenimiento: 'Pendiente del Jefe de Mantenimiento',
      completado: 'Completada',
      rechazado: 'Rechazada',
      archivado: 'Archivada',
    };
    return texts[estado] || estado;
  };

  const puedeFirmar = () => {
    const estado = solicitud?.estado;
    const rol = user?.rol?.nombre;
    
    if (rol === 'jefe_servicio' && estado === 'pendiente_jefe_seccion') return true;
    if (rol === 'jefe_soporte' && estado === 'pendiente_soporte') return true;
    if (rol === 'admin_sistema' && estado === 'pendiente_jefe_activos') return true;
    return false;
  };

  const handleFirmar = () => {
    navigation.navigate('FirmarSolicitud', { id, solicitud });
  };

  const handleVerPDF = async () => {
    if (pdfUrl) {
      try {
        const supported = await Linking.canOpenURL(pdfUrl);
        if (supported) {
          await Linking.openURL(pdfUrl);
        } else {
          Alert.alert('Error', 'No se puede abrir el PDF');
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo abrir el PDF');
      }
    } else {
      Alert.alert('Error', 'PDF no disponible');
    }
  };

  const handleCompartir = async () => {
    try {
      await Share.share({
        message: `Solicitud #${solicitud?.id}: ${solicitud?.titulo}\nEstado: ${getStatusText(solicitud?.estado)}\nVer en: ${pdfUrl}`,
      });
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.id}>Solicitud #{solicitud?.id}</Text>
          <TouchableOpacity onPress={handleCompartir}>
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(solicitud?.estado) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(solicitud?.estado) }]}>
            {getStatusText(solicitud?.estado)}
          </Text>
        </View>

        <Text style={styles.label}>Título</Text>
        <Text style={styles.value}>{solicitud?.titulo || 'Sin título'}</Text>

        <Text style={styles.label}>Descripción</Text>
        <Text style={styles.value}>{solicitud?.descripcion || 'Sin descripción'}</Text>

        <Text style={styles.label}>Equipo</Text>
        <Text style={styles.value}>{solicitud?.equipo?.nombre || 'No especificado'}</Text>

        <Text style={styles.label}>Ubicación</Text>
        <Text style={styles.value}>{solicitud?.ubicacion?.nombre || 'No especificada'}</Text>

        <Text style={styles.label}>Solicitante</Text>
        <Text style={styles.value}>{solicitud?.solicitante?.nombre_completo || 'Desconocido'}</Text>

        <Text style={styles.label}>Fecha de Creación</Text>
        <Text style={styles.value}>
          {solicitud?.creado_en ? new Date(solicitud.creado_en).toLocaleDateString('es-ES') : ''}
        </Text>

        {solicitud?.tecnico_asignado_id && (
          <>
            <Text style={styles.label}>Técnico Asignado</Text>
            <Text style={styles.value}>{solicitud?.tecnico_asignado?.nombre_completo || 'No asignado'}</Text>
          </>
        )}

        {solicitud?.trabajo_terminado_en && (
          <>
            <Text style={styles.label}>Fecha de Completado</Text>
            <Text style={styles.value}>
              {new Date(solicitud.trabajo_terminado_en).toLocaleDateString('es-ES')}
            </Text>
          </>
        )}

        {solicitud?.notas_tecnico && (
          <>
            <Text style={styles.label}>Notas del Técnico</Text>
            <Text style={styles.value}>{solicitud.notas_tecnico}</Text>
          </>
        )}

        <View style={styles.buttonRow}>
          {pdfUrl && (
            <TouchableOpacity style={styles.pdfButton} onPress={handleVerPDF}>
              <Text style={styles.buttonText}>📄 Ver PDF</Text>
            </TouchableOpacity>
          )}

          {puedeFirmar() && (
            <TouchableOpacity style={styles.signButton} onPress={handleFirmar}>
              <Text style={styles.buttonText}>✍️ Firmar Solicitud</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', margin: 15, borderRadius: 12, padding: 20, elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  id: { fontSize: 18, fontWeight: 'bold', color: '#1a56db' },
  shareIcon: { fontSize: 20 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20 },
  statusText: { fontSize: 12, fontWeight: '500' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#666', marginTop: 15, marginBottom: 5 },
  value: { fontSize: 15, color: '#333', lineHeight: 22 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 25 },
  pdfButton: { flex: 1, backgroundColor: '#6b7280', borderRadius: 10, padding: 14, alignItems: 'center' },
  signButton: { flex: 1, backgroundColor: '#10b981', borderRadius: 10, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});