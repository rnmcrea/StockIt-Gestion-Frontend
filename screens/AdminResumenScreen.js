import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { getApiUrl } from '../config/config';
import CustomHeader from '../components/CustomHeader';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function AdminResumenScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const { toast, showToast, hideToast } = useToast();

  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth() + 1); // 1-12

  const [data, setData] = useState({ items: [], totalGeneral: 0, totalRepuestos: 0 });
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/resumen-mensual?year=${year}&month=${month}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al consultar');
      setData(await res.json());
    } catch (e) {
      console.error(e);
      showToast('No se pudo cargar el resumen', 'error');
      setData({ items: [], totalGeneral: 0, totalRepuestos: 0 });
    } finally {
      setCargando(false);
    }
  }, [token, year, month]);

  useEffect(() => { cargar(); }, [cargar]);

  const mesAnterior = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1);
  };
  const mesSiguiente = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.item}>
      <Text style={styles.rank}>{index + 1}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.codigo}>{item.codigo}</Text>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.desglose}>Consumo: {item.consumo} · Facturable: {item.facturable}</Text>
      </View>
      <Text style={styles.total}>{item.total}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader />
      <View style={styles.container}>
        <TouchableOpacity style={styles.volver} onPress={() => navigation.navigate('AdminHome')}>
          <ChevronLeft size={18} color="#2196F3" />
          <Text style={styles.volverText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Resumen mensual</Text>

        {/* Selector de mes */}
        <View style={styles.selectorMes}>
          <TouchableOpacity onPress={mesAnterior} style={styles.flecha}>
            <ChevronLeft size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.mesTexto}>{MESES[month - 1]} {year}</Text>
          <TouchableOpacity onPress={mesSiguiente} style={styles.flecha}>
            <ChevronRight size={22} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Totales */}
        <View style={styles.totalesRow}>
          <View style={styles.totalCard}>
            <Text style={styles.totalNum}>{data.totalGeneral}</Text>
            <Text style={styles.totalLabel}>unidades usadas</Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalNum}>{data.totalRepuestos}</Text>
            <Text style={styles.totalLabel}>repuestos distintos</Text>
          </View>
        </View>

        <FlatList
          data={data.items}
          keyExtractor={(item) => item.codigo}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={() => (
            <Text style={styles.vacio}>{cargando ? 'Cargando...' : 'Sin usos registrados en este mes'}</Text>
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
  selectorMes: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd',
    paddingHorizontal: 8, paddingVertical: 6, marginBottom: 12,
  },
  flecha: { padding: 8 },
  mesTexto: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalesRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  totalCard: { flex: 1, backgroundColor: '#e3f2fd', borderRadius: 10, padding: 14, alignItems: 'center' },
  totalNum: { fontSize: 24, fontWeight: 'bold', color: '#1976D2' },
  totalLabel: { fontSize: 12, color: '#555', marginTop: 2, textAlign: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 8, elevation: 1 },
  rank: { width: 28, fontSize: 16, fontWeight: 'bold', color: '#bbb', textAlign: 'center' },
  codigo: { fontSize: 15, fontWeight: 'bold', color: '#000' },
  nombre: { fontSize: 13, color: '#555', marginTop: 1 },
  desglose: { fontSize: 12, color: '#888', marginTop: 2 },
  total: { fontSize: 20, fontWeight: 'bold', color: '#2196F3', marginLeft: 10 },
  vacio: { textAlign: 'center', color: '#999', marginTop: 30, fontStyle: 'italic' },
});
