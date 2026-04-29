// src/screens/NuevaSolicitudScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { solicitudService } from '../services/solicitudService';
import { equipoService } from '../services/equipoService';
import { authService } from '../services/authService';
import { Picker } from '@react-native-picker/picker';

export const NuevaSolicitudScreen = ({ navigation }: any) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoSolicitud, setTipoSolicitud] = useState('sin_material');
  const [equipoId, setEquipoId] = useState('');
  const [equipos, setEquipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cargandoEquipos, setCargandoEquipos] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserAndEquipos();
  }, []);

  const loadUserAndEquipos = async () => {
    const userData = await authService.getUser();
    setUser(userData);
    
    try {
      const response = await equipoService.getAll();
      setEquipos(response.data || []);
    } catch (error) {
      console.error('Error cargando equipos:', error);
      Alert.alert('Error', 'No se pudieron cargar los equipos');
    } finally {
      setCargandoEquipos(false);
    }
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'Ingresa un título');
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Ingresa una descripción');
      return;
    }

    setLoading(true);
    
    try {
      const data = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo_solicitud: tipoSolicitud,
        equipo_id: equipoId ? parseInt(equipoId) : null,
      };
      
      const response = await solicitudService.create(data);
      
      if (response.success) {
        Alert.alert(
          'Éxito', 
          'Solicitud creada correctamente',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', response.message || 'No se pudo crear la solicitud');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Equipo de rayos X no funciona"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Descripción *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe el problema detalladamente..."
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Tipo de Solicitud</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipoSolicitud}
            onValueChange={(value) => setTipoSolicitud(value)}
          >
            <Picker.Item label="Sin Material" value="sin_material" />
            <Picker.Item label="Con Material" value="con_material" />
          </Picker>
        </View>

        <Text style={styles.label}>Equipo (opcional)</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={equipoId}
            onValueChange={(value) => setEquipoId(value)}
            enabled={!cargandoEquipos}
          >
            <Picker.Item label="Seleccionar equipo..." value="" />
            {equipos.map((equipo) => (
              <Picker.Item
                key={equipo.id}
                label={`${equipo.codigo_equipo} - ${equipo.nombre}`}
                value={equipo.id.toString()}
              />
            ))}
          </Picker>
        </View>
        {cargandoEquipos && <ActivityIndicator size="small" color="#1a56db" />}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Crear Solicitud</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#1a56db',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});