// src/screens/EscanerQRScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { solicitudService } from '../services/solicitudService';

export const EscanerQRScreen = ({ navigation }: any) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      let solicitudId = data;
      if (data.includes(':')) {
        solicitudId = data.split(':')[1];
      }
      
      const id = parseInt(solicitudId);
      if (isNaN(id)) {
        Alert.alert('Error', 'QR inválido');
        setScanned(false);
        setLoading(false);
        return;
      }

      const response = await solicitudService.getById(id);
      
      if (response.success) {
        navigation.navigate('DetalleSolicitud', { id });
      } else {
        Alert.alert('Error', 'Solicitud no encontrada');
        setScanned(false);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el QR');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
        <Text>Solicitando permisos de cámara...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text>No hay acceso a la cámara</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text style={styles.buttonText}>Solicitar Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'codabar', 'code39', 'code93', 'code128', 'ean8', 'ean13', 'itf14', 'upc_a', 'upc_e'],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.instruction}>
          {loading ? 'Procesando...' : 'Coloca el código QR dentro del recuadro'}
        </Text>
        {scanned && !loading && (
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.rescanText}>Escanear otro QR</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
    marginBottom: 30,
  },
  instruction: { color: '#fff', fontSize: 14, textAlign: 'center', paddingHorizontal: 20, marginBottom: 20 },
  button: { backgroundColor: '#1a56db', padding: 12, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  rescanButton: { backgroundColor: '#1a56db', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  rescanText: { color: '#fff', fontSize: 14 },
});