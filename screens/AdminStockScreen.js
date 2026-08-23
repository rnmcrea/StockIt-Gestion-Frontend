import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { getApiUrl } from '../config/config';
import CustomHeader from '../components/CustomHeader';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { ChevronLeft, ChevronDown, ChevronUp, User } from 'lucide-react-native';

export default function AdminStockScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const { toast, showToast, hideToast } = useToast();

  const [tecnicos, setTecnicos] = useState([]);
  const [abierto, setAbierto] = useState({}); // { [usuario]: bool }
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/stock-tecnicos'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al consultar');
      setTecnicos(await res.json());
    } catch (e) {
      console.error(e);
      showToast('No se pudo cargar el stock', 'error');
      setTecnicos([]);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const toggle = (usuario) => setAbierto((prev) => ({ ...prev, [usuario]: !prev[usuario] }));

  const renderTecnico = ({ item }) => {
    const expandido = !!abierto[item.usuario];
    return (
      <View style={styles.tarjeta}>
        <TouchableOpacity style={styles.tecnicoHeader} onPress={() => toggle(item.usuario)}>
          <User size={18} color="#2196F3" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.tecnicoNombre}>{item.usuario}</Text>
            <Text style={styles.tecnicoResumen}>{item.totalItems} repuestos · {item.totalUnidades} unidades</Text>
          </View>
          {expandido ? <ChevronUp size={20} color="#888" /> : <ChevronDown size={20} color="#888" />}
        </TouchableOpacity>

        {expandido && (
          <View style={styles.itemsContainer}>
            {item.items.map((r, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemCodigo}>{r.codigo}</Text>
                  <Text style={styles.itemNombre}>{r.nombre}</Text>
                </View>
                <Text style={styles.itemCantidad}>x{r.cantidad}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader />
      <View style={styles.container}>
        <TouchableOpacity style={styles.volver} onPress={() => navigation.navigate('AdminHome')}>
          <ChevronLeft size={18} color="#2196F3" />
          <Text style={styles.volverText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Stock por técnico</Text>

        <FlatList
          data={tecnicos}
          keyExtractor={(item) => item.usuario}
          renderItem={renderTecnico}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={() => (
            <Text style={styles.vacio}>{cargando ? 'Cargando...' : 'Ningún técnico tiene stock actualmente'}</Text>
          )}
        />
      </View>

      <Toast message={toast.message} visible={toast.visible} onHide={hideToast} type={toast.type} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  volver: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  volverText: { color: '#2196F3', fontSize: 15, fontWeight: '600' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, elevation: 1, overflow: 'hidden' },
  tecnicoHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  tecnicoNombre: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  tecnicoResumen: { fontSize: 13, color: '#666', marginTop: 2 },
  itemsContainer: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingHorizontal: 14, paddingBottom: 6 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  itemCodigo: { fontSize: 14, fontWeight: '600', color: '#333' },
  itemNombre: { fontSize: 13, color: '#666', marginTop: 1 },
  itemCantidad: { fontSize: 15, fontWeight: 'bold', color: '#2196F3', marginLeft: 10 },
  vacio: { textAlign: 'center', color: '#999', marginTop: 30, fontStyle: 'italic' },
});
