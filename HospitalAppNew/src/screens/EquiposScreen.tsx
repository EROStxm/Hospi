// src/screens/EquiposScreen.tsx
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
  ScrollView,
} from 'react-native';
import { equipoService } from '../services/equipoService';

// Definir tipos
interface Categoria {
  id: number;
  nombre: string;
}

interface Equipo {
  id: number;
  codigo_equipo: string;
  nombre: string;
  estado: string;
  marca?: string;
  modelo?: string;
  categoria?: Categoria;
  sector?: { nombre: string };
}

export const EquiposScreen = ({ navigation }: any) => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [filteredEquipos, setFilteredEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await equipoService.getAll();
      const equiposData = (response.data || []) as Equipo[];
      setEquipos(equiposData);
      setFilteredEquipos(equiposData);
      
      // Extraer categorías únicas
      const categoriasMap = new Map<number, Categoria>();
      equiposData.forEach((equipo: Equipo) => {
        if (equipo.categoria?.id && equipo.categoria?.nombre) {
          categoriasMap.set(equipo.categoria.id, {
            id: equipo.categoria.id,
            nombre: equipo.categoria.nombre,
          });
        }
      });
      setCategorias(Array.from(categoriasMap.values()));
    } catch (error) {
      console.error('Error loading equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    filterEquipos(text, selectedCategoria);
  };

  const filterByCategoria = (categoriaId: string | null) => {
    setSelectedCategoria(categoriaId);
    filterEquipos(searchText, categoriaId);
  };

  const filterEquipos = (text: string, categoriaId: string | null) => {
    let filtered = [...equipos];
    
    if (text) {
      filtered = filtered.filter(e => 
        e.nombre.toLowerCase().includes(text.toLowerCase()) ||
        e.codigo_equipo?.toLowerCase().includes(text.toLowerCase()) ||
        e.marca?.toLowerCase().includes(text.toLowerCase())
      );
    }
    
    if (categoriaId) {
      filtered = filtered.filter(e => e.categoria?.id === parseInt(categoriaId));
    }
    
    setFilteredEquipos(filtered);
  };

  const getEstadoColor = (estado: string): string => {
    const colors: Record<string, string> = {
      operativo: '#10b981',
      mantenimiento: '#f59e0b',
      averiado: '#ef4444',
      baja: '#6b7280',
    };
    return colors[estado] || '#6b7280';
  };

  const getEstadoText = (estado: string): string => {
    const texts: Record<string, string> = {
      operativo: 'Operativo',
      mantenimiento: 'En Mantenimiento',
      averiado: 'Averiado',
      baja: 'Dado de Baja',
    };
    return texts[estado] || estado;
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
          placeholder="Buscar equipo..."
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* Filtros de categoría */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedCategoria && styles.filterChipActive]}
          onPress={() => filterByCategoria(null)}
        >
          <Text style={[styles.filterText, !selectedCategoria && styles.filterTextActive]}>Todos</Text>
        </TouchableOpacity>
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filterChip, selectedCategoria === cat.id.toString() && styles.filterChipActive]}
            onPress={() => filterByCategoria(cat.id.toString())}
          >
            <Text style={[styles.filterText, selectedCategoria === cat.id.toString() && styles.filterTextActive]}>
              {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de equipos */}
      <FlatList
        data={filteredEquipos}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay equipos registrados</Text>
          </View>
        }
        renderItem={({ item }: { item: Equipo }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DetalleEquipo', { id: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardCode}>{item.codigo_equipo}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(item.estado) + '20' }]}>
                <Text style={[styles.statusText, { color: getEstadoColor(item.estado) }]}>
                  {getEstadoText(item.estado)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.cardName}>{item.nombre}</Text>
            
            <View style={styles.cardDetails}>
              <Text style={styles.cardDetail}>📌 {item.categoria?.nombre || 'Sin categoría'}</Text>
              <Text style={styles.cardDetail}>🏥 {item.sector?.nombre || 'Sin sector'}</Text>
              {item.marca && <Text style={styles.cardDetail}>🔧 {item.marca} {item.modelo || ''}</Text>}
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
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 10 },
  filterChipActive: { backgroundColor: '#1a56db' },
  filterText: { fontSize: 13, color: '#666' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', margin: 12, marginBottom: 0, borderRadius: 12, padding: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardCode: { fontSize: 14, fontWeight: 'bold', color: '#1a56db' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '500' },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  cardDetails: { gap: 4 },
  cardDetail: { fontSize: 13, color: '#666' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 14 },
});