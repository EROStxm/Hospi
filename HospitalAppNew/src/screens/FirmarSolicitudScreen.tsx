// src/screens/FirmarSolicitudScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { solicitudService } from '../services/solicitudService';
import { authService } from '../services/authService';
import { huellaService } from '../services/huellaService';

export const FirmarSolicitudScreen = ({ route, navigation }: any) => {
  const { id, solicitud } = route.params;
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [espOnline, setEspOnline] = useState(false);
  const [firmandoConHuella, setFirmandoConHuella] = useState(false);

  useEffect(() => {
    loadUser();
    checkESP32();
  }, []);

  const loadUser = async () => {
    const userData = await authService.getUser();
    setUser(userData);
  };

  const checkESP32 = async () => {
    const online = await huellaService.verificarESP32();
    setEspOnline(online);
  };

  const firmarConPassword = async () => {
    setLoading(true);
    try {
      const response = await solicitudService.firmar(id);
      if (response.success) {
        Alert.alert('Éxito', 'Solicitud firmada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', response.message || 'No se pudo firmar');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al firmar');
    } finally {
      setLoading(false);
    }
  };

  const firmarConHuella = async () => {
    if (!espOnline) {
      Alert.alert('Error', 'Sensor de huellas no disponible');
      return;
    }

    setFirmandoConHuella(true);
    
    const toastId = setTimeout(() => {
      Alert.alert('Info', 'Coloca tu dedo en el sensor AS608 para firmar');
    }, 500);

    try {
      // Iniciar espera de huella en el ESP32
      await huellaService.iniciarRegistro(user?.id);
      
      // Esperar resultado (polling)
      let completado = false;
      let intentos = 0;
      
      while (!completado && intentos < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const estado = await huellaService.verificarEstadoRegistro(user?.id);
        
        if (estado.completado) {
          completado = true;
          // Firmar la solicitud
          const response = await solicitudService.firmar(id);
          if (response.success) {
            Alert.alert('Éxito', 'Solicitud firmada con huella', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        } else if (estado.error) {
          throw new Error(estado.message || 'Error en la verificación');
        }
        intentos++;
      }
      
      if (!completado) {
        Alert.alert('Error', 'Tiempo de espera agotado');
      }
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al verificar la huella');
    } finally {
      clearTimeout(toastId);
      setFirmandoConHuella(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Firmar Solicitud</Text>
        <Text style={styles.subtitle}>#{id} - {solicitud?.titulo}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Estás a punto de firmar esta solicitud como:
          </Text>
          <Text style={styles.userName}>{user?.nombre_completo}</Text>
          <Text style={styles.userRole}>{user?.rol?.nombre?.replace('_', ' ')}</Text>
        </View>

        <View style={styles.statusBox}>
          <View style={[styles.espStatus, espOnline ? styles.espOnline : styles.espOffline]}>
            <Text style={styles.espStatusText}>
              {espOnline ? '🟢 Sensor AS608 disponible' : '🔴 Sensor AS608 no disponible'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.buttonPassword}
          onPress={firmarConPassword}
          disabled={loading || firmandoConHuella}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>✍️ Firmar con Contraseña</Text>
          )}
        </TouchableOpacity>

        {espOnline && (
          <TouchableOpacity
            style={styles.buttonHuella}
            onPress={firmarConHuella}
            disabled={loading || firmandoConHuella}
          >
            {firmandoConHuella ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🖐️ Firmar con Huella</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.buttonCancel}
          onPress={() => navigation.goBack()}
          disabled={loading || firmandoConHuella}
        >
          <Text style={styles.buttonCancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', margin: 15, borderRadius: 12, padding: 20, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  infoBox: { backgroundColor: '#f0f4f8', borderRadius: 10, padding: 15, marginBottom: 20 },
  infoText: { fontSize: 13, color: '#666', textAlign: 'center' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center', marginTop: 8 },
  userRole: { fontSize: 13, color: '#1a56db', textAlign: 'center', marginTop: 4, textTransform: 'capitalize' },
  statusBox: { alignItems: 'center', marginBottom: 25 },
  espStatus: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  espOnline: { backgroundColor: '#d1fae5' },
  espOffline: { backgroundColor: '#fee2e2' },
  espStatusText: { fontSize: 12, fontWeight: '500' },
  buttonPassword: { backgroundColor: '#1a56db', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonHuella: { backgroundColor: '#10b981', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonCancel: { backgroundColor: '#f3f4f6', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonCancelText: { color: '#666', fontSize: 16 },
});