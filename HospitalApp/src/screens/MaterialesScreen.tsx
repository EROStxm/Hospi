// src/screens/MaterialesScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { materialService } from '../services/materialService';

export const MaterialesScreen = ({ navigation }: any) => {
  const [materiales, setMateriales] = useState<any[]>([]);
  const [filteredMateriales, setFilteredMateriales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showStockBajoOnly, setShowStockBajoOnly] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await materialService.getAll();
      const materialesData = response.data || [];
      setMateriales(materialesData);
      applyFilters(materialesData, searchText, showStockBajoOnly);
    } catch (error) {
      console.error('Error loading materiales:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const applyFilters = (data: any[], text: string, stockBajoOnly: boolean) => {
    let filtered = [...data];
    
    if (text) {
      filtered = filtered.filter(m => 
        m.nombre.toLowerCase().includes(text.toLowerCase()) ||
        m.codigo?.toLowerCase().includes(text.toLowerCase()) ||
        m.categoria?.toLowerCase().includes(text.toLowerCase())
      );
    }
    
    if (stockBajoOnly) {
      filtered = filtered.filter(m => m.stock <= m.stock_minimo);
    }
    
    setFilteredMateriales(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    applyFilters(materiales, text, showStockBajoOnly);
  };

  const toggleStockBajo = () => {
    const newValue = !showStockBajoOnly;
    setShowStockBajoOnly(newValue);
    applyFilters(materiales, searchText, newValue);
  };

  const getStockColor = (stock: number, stockMinimo: number) => {
    if (stock <= 0) return '#ef4444';
    if (stock <= stockMinimo) return '#f59e0b';
    return '#10b981';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a56db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar material..."
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, showStockBajoOnly && styles.filterButtonActive]}
          onPress={toggleStockBajo}
        >
          <Text style={[styles.filterButtonText, showStockBajoOnly && styles.filterButtonTextActive]}>
            📉 Stock Bajo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de materiales */}
      <FlatList
        data={filteredMateriales}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay materiales registrados</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DetalleMaterial', { id: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardCode}>{item.codigo}</Text>
              <View style={[styles.stockBadge, { backgroundColor: getStockColor(item.stock, item.stock_minimo) + '20' }]}>
                <Text style={[styles.stockText, { color: getStockColor(item.stock, item.stock_minimo) }]}>
                  Stock: {item.stock}
                </Text>
              </View>
            </View>
            
            <Text style={styles.cardName}>{item.nombre}</Text>
            
            <View style={styles.cardDetails}>
              <Text style={styles.cardDetail}>📂 {item.categoria || 'Sin categoría'}</Text>
              <Text style={styles.cardDetail}>📦 Unidad: {item.unidad}</Text>
              {item.costo_unitario && (
                <Text style={styles.cardDetail}>💰 S/ {item.costo_unitario}</Text>
              )}
              {item.stock <= item.stock_minimo && (
                <Text style={styles.warningText}>⚠️ Stock mínimo: {item.stock_minimo}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchInput: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, fontSize: 16 },
  filtersContainer: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', flexDirection: 'row' },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  filterButtonActive: { backgroundColor: '#f59e0b' },
  filterButtonText: { fontSize: 13, color: '#666' },
  filterButtonTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', margin: 12, marginBottom: 0, borderRadius: 12, padding: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardCode: { fontSize: 14, fontWeight: 'bold', color: '#1a56db' },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  stockText: { fontSize: 11, fontWeight: '500' },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  cardDetails: { gap: 4 },
  cardDetail: { fontSize: 13, color: '#666' },
  warningText: { fontSize: 12, color: '#f59e0b', marginTop: 5 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 14 },
});