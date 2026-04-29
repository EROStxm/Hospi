import api from './api';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

export const authService = {
  // Login con código militar y contraseña
  login: async (codigo_militar: string, contrasena: string) => {
    const response = await api.post('/login', { codigo_militar, contrasena });
    if (response.data.token) {
      await SecureStore.setItemAsync('token', response.data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Verificar soporte biométrico
  hasBiometricSupport: async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  // Login con huella del móvil
  loginWithBiometric: async () => {
    const savedCredentials = await SecureStore.getItemAsync('saved_credentials');
    if (!savedCredentials) {
      throw new Error('No hay credenciales guardadas');
    }
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticación Biométrica',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: true,
    });
    
    if (result.success) {
      const { codigo_militar, contrasena } = JSON.parse(savedCredentials);
      return await authService.login(codigo_militar, contrasena);
    }
    throw new Error('Autenticación fallida');
  },

  // Guardar credenciales
  saveBiometricCredentials: async (codigo_militar: string, contrasena: string) => {
    await SecureStore.setItemAsync('saved_credentials', JSON.stringify({
      codigo_militar,
      contrasena,
    }));
  },

  // Eliminar credenciales
  clearBiometricCredentials: async () => {
    await SecureStore.deleteItemAsync('saved_credentials');
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
  },

  // Obtener usuario actual
  getUser: async () => {
    const user = await SecureStore.getItemAsync('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar sesión
  isAuthenticated: async () => {
    const token = await SecureStore.getItemAsync('token');
    return !!token;
  },
};