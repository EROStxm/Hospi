import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { authService } from '../services/authService';

export const LoginScreen = ({ navigation }: any) => {
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    checkBiometricAndSession();
  }, []);

  const checkBiometricAndSession = async () => {
    const isAuth = await authService.isAuthenticated();
    if (isAuth) {
      navigation.replace('Main');
      return;
    }
    const hasBiometric = await authService.hasBiometricSupport();
    setBiometricAvailable(hasBiometric);
  };

  const handleLogin = async () => {
    if (!codigo || !password) {
      Alert.alert('Error', 'Ingresa tu código militar y contraseña');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(codigo, password);
      
      if (response.success) {
        if (rememberMe) {
          await authService.saveBiometricCredentials(codigo, password);
        }
        navigation.replace('Main');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      await authService.loginWithBiometric();
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo autenticar con huella');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🏥 Hospital Militar</Text>
          <Text style={styles.subtitle}>Sistema de Mantenimiento</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>RED INTERNA</Text>
          </View>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Código Militar"
            placeholderTextColor="#999"
            value={codigo}
            onChangeText={setCodigo}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkboxMark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Recordar para usar huella</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {biometricAvailable && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <Text style={styles.biometricText}>🔐 Iniciar con Huella</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.footer}>Hospital Militar - Sistema Interno v1.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a56db', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 10 },
  badge: { backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 10, color: '#1a56db', fontWeight: 'bold' },
  form: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 3 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#1a56db', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#1a56db' },
  checkboxMark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 14, color: '#666' },
  button: { backgroundColor: '#1a56db', borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  biometricButton: { backgroundColor: '#f3f4f6', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  biometricText: { color: '#333', fontSize: 14 },
  footer: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 30 },
});