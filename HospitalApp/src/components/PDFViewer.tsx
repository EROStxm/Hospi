// src/components/PDFViewer.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Share,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface PDFViewerProps {
  visible: boolean;
  pdfUrl: string;
  title?: string;
  onClose: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  visible,
  pdfUrl,
  title = 'Documento',
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: pdfUrl,
        title: title,
      });
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  const handleOpenExternal = async () => {
    try {
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert('Error', 'No se puede abrir el archivo');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el PDF');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Text style={styles.shareText}>📤</Text>
          </TouchableOpacity>
        </View>

        {/* WebView para mostrar PDF */}
        <View style={styles.webviewContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1a56db" />
              <Text style={styles.loadingText}>Cargando PDF...</Text>
            </View>
          )}
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No se pudo cargar el PDF</Text>
              <TouchableOpacity
                style={styles.externalButton}
                onPress={handleOpenExternal}
              >
                <Text style={styles.externalButtonText}>Abrir en navegador</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              source={{ uri: pdfUrl }}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
              style={styles.webview}
              startInLoadingState={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#1a56db',
    elevation: 3,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareText: {
    fontSize: 20,
    color: '#fff',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  externalButton: {
    backgroundColor: '#1a56db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  externalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});