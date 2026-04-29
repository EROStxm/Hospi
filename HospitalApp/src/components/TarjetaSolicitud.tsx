// src/components/TarjetaSolicitud.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface TarjetaSolicitudProps {
  solicitud: {
    id: number;
    titulo: string;
    descripcion: string;
    estado: string;
    creado_en: string;
    equipo?: { nombre: string };
    sector?: { nombre: string };
  };
  onPress: () => void;
  showDetails?: boolean;
}

export const TarjetaSolicitud: React.FC<TarjetaSolicitudProps> = ({
  solicitud,
  onPress,
  showDetails = true,
}) => {
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
      pendiente_jefe_activos: 'Rev. Activos',
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

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.id}>#{solicitud.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(solicitud.estado) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(solicitud.estado) }]}>
            {getStatusText(solicitud.estado)}
          </Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {solicitud.titulo || 'Sin título'}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {solicitud.descripcion || 'Sin descripción'}
      </Text>

      {showDetails && (
        <View style={styles.details}>
          {solicitud.equipo?.nombre && (
            <Text style={styles.detailText}>🖥️ {solicitud.equipo.nombre}</Text>
          )}
          {solicitud.sector?.nombre && (
            <Text style={styles.detailText}>📍 {solicitud.sector.nombre}</Text>
          )}
        </View>
      )}

      <Text style={styles.date}>📅 {formatDate(solicitud.creado_en)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  id: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a56db',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 12,
    color: '#888',
  },
  date: {
    fontSize: 11,
    color: '#999',
  },
});