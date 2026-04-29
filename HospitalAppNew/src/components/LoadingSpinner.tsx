// src/components/LoadingSpinner.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';

interface LoadingSpinnerProps {
  visible: boolean;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible,
  message = 'Cargando...',
  fullScreen = true,
}) => {
  if (!visible) return null;

  const SpinnerContent = () => (
    <View style={styles.container}>
      <View style={styles.spinnerCard}>
        <ActivityIndicator size="large" color="#1a56db" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );

  if (fullScreen) {
    return (
      <Modal transparent={true} animationType="fade" visible={visible}>
        <SpinnerContent />
      </Modal>
    );
  }

  return <SpinnerContent />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  spinnerCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  message: {
    marginTop: 15,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});