import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet, Platform, Pressable,
  TouchableOpacity, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../context/AuthContext';
import { getApiUrl } from '../config/config';
import CustomHeader from '../components/CustomHeader';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { Calendar, ChevronLeft, Users } from 'lucide-react-native';

const estiloInputFechaWeb = {
  width: '100%', boxSizing: 'border-box', padding: 9, fontSize: 14,
  borderWidth: 1, borderStyle: 'solid', borderColor: '#ccc', borderRadius: 5,
  backgroundColor: '#fff', color: '#333',
};

export default function AdminUsosScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const { toast, showToast, hideToast } = useToast();

  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoSel, setTecnicoSel] = useState(''); // '' = todos
  const [modalTecnico, setModalTecnico] = useState(false);

  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFin, setMostrarFin] = useState(false);

  const [usos, setUsos] = useState([]);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const aValorInput = (f) => {
    if (!f) return '';
    return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
  };
  const desdeValorInput = (v) => {
    if (!v) return null;
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const mostrarFecha = (f) => (f ? f.toLocaleDateString() : null);
  const formatearFecha = (iso) => {
    const f = new Date(iso);
    return `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}/${f.getFullYear()}`;
  };

  useEffect(() => {
    const cargarTecnicos = async () => {
      try {
        const res = await fetch(getApiUrl('/api/admin/tecnicos'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setTecnicos(await res.json());
      } catch (e) {
        console.error('Error cargando técnicos:', e);
      }
    };
    cargarTecnicos();
  }, [token]);

  const buscar = async () => {
    setCargando(true);
    setBuscado(true);
    try {
      const params = new URLSearchParams();
      if (tecnicoSel) params.append('tecnico', tecnicoSel);
      if (fechaInicio) params.append('desde', aValorInput(fechaInicio));
      if (fechaFin) params.append('hasta', aValorInput(fechaFin));

      const res = await fetch(getApiUrl(`/api/admin/usos?${params.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al consultar');
      const data = await res.json();
      setUsos(data.usos || []);
      setTotalUnidades(data.totalUnidades || 0);
    } catch (e) {
      console.error(e);
      showToast('No se pudieron cargar los usos', 'error');
      setUsos([]);
    } finally {
      setCargando(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.codigo}>{item.codigo}</Text>
        <Text style={styles.cantidad}>x{item.cantidad}</Text>
      </View>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.detalle}>Técnico: {item.usuario}</Text>
      <Text style={styles.detalle}>Cliente: {item.cliente || 'N/A'} · Local: {item.lugarUso || 'N/A'}</Text>
      <View style={styles.itemFooter}>
        <Text style={styles.tipo}>{item.tipoConsumo || 'N/A'}</Text>
        <Text style={styles.fecha}>{formatearFecha(item.fecha)}</Text>
      </View>
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

        <Text style={styles.titulo}>Usos por técnico</Text>

        {/* Selector de técnico */}
        <TouchableOpacity style={styles.selectorTecnico} onPress={() => setModalTecnico(true)}>
          <Users size={16} color="#333" />
          <Text style={styles.selectorTexto}>{tecnicoSel || 'Todos los técnicos'}</Text>
        </TouchableOpacity>

        {/* Fechas */}
        {Platform.OS === 'web' ? (
          <View style={styles.fechas}>
            <View style={styles.fechaCampo}>
              <View style={styles.fechaLabelRow}><Calendar size={13} color="#555" /><Text style={styles.fechaLabel}>Desde</Text></View>
              <input type="date" value={aValorInput(fechaInicio)} max={aValorInput(fechaFin) || undefined}
                onChange={(e) => setFechaInicio(desdeValorInput(e.target.value))} style={estiloInputFechaWeb} />
            </View>
            <View style={styles.fechaCampo}>
              <View style={styles.fechaLabelRow}><Calendar size={13} color="#555" /><Text style={styles.fechaLabel}>Hasta</Text></View>
              <input type="date" value={aValorInput(fechaFin)} min={aValorInput(fechaInicio) || undefined}
                onChange={(e) => setFechaFin(desdeValorInput(e.target.value))} style={estiloInputFechaWeb} />
            </View>
          </View>
        ) : (
          <View style={styles.fechas}>
            <Pressable onPress={() => setMostrarInicio(true)} style={styles.fechaBtn}>
              <Text style={styles.fechaTexto}>📅 Desde: {mostrarFecha(fechaInicio) || 'Seleccione'}</Text>
            </Pressable>
            <Pressable onPress={() => setMostrarFin(true)} style={styles.fechaBtn}>
              <Text style={styles.fechaTexto}>📅 Hasta: {mostrarFecha(fechaFin) || 'Seleccione'}</Text>
            </Pressable>
          </View>
        )}

        {mostrarInicio && (
          <DateTimePicker value={fechaInicio || new Date()} mode="date" display="default"
            onChange={(ev, d) => { setMostrarInicio(Platform.OS === 'ios'); if (d) setFechaInicio(d); }} />
        )}
        {mostrarFin && (
          <DateTimePicker value={fechaFin || new Date()} mode="date" display="default"
            onChange={(ev, d) => { setMostrarFin(Platform.OS === 'ios'); if (d) setFechaFin(d); }} />
        )}

        <TouchableOpacity style={styles.botonFiltrar} onPress={buscar} disabled={cargando}>
          <Text style={styles.textoBoton}>{cargando ? 'BUSCANDO...' : 'BUSCAR'}</Text>
        </TouchableOpacity>

        {buscado && !cargando && (
          <Text style={styles.resumen}>{usos.length} registros · {totalUnidades} unidades</Text>
        )}

        <FlatList
          data={usos}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={() => (
            <Text style={styles.vacio}>
              {buscado ? 'Sin registros para ese filtro' : 'Elige filtros y presiona BUSCAR'}
            </Text>
          )}
        />
      </View>

      {/* Modal selector de técnico */}
      <Modal transparent animationType="fade" visible={modalTecnico} onRequestClose={() => setModalTecnico(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalTecnico(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar técnico</Text>
            <TouchableOpacity style={styles.opcion} onPress={() => { setTecnicoSel(''); setModalTecnico(false); }}>
              <Text style={styles.opcionTexto}>Todos los técnicos</Text>
            </TouchableOpacity>
            {tecnicos.map((t) => (
              <TouchableOpacity key={t._id} style={styles.opcion} onPress={() => { setTecnicoSel(t.nombre); setModalTecnico(false); }}>
                <Text style={styles.opcionTexto}>{t.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

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
  selectorTecnico: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10,
  },
  selectorTexto: { fontSize: 15, color: '#333' },
  fechas: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  fechaCampo: { flex: 1, marginHorizontal: 5 },
  fechaLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  fechaLabel: { fontSize: 12, color: '#555', fontWeight: '600' },
  fechaBtn: { flex: 1, padding: 10, backgroundColor: '#fff', borderRadius: 5, marginHorizontal: 5, borderWidth: 1, borderColor: '#ddd' },
  fechaTexto: { textAlign: 'center', fontSize: 12 },
  botonFiltrar: { backgroundColor: '#60A5FA', paddingVertical: 13, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  textoBoton: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resumen: { fontSize: 13, color: '#555', marginBottom: 8, fontWeight: '600' },
  item: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10, elevation: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codigo: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  cantidad: { fontSize: 15, fontWeight: 'bold', color: '#2196F3' },
  nombre: { fontSize: 14, color: '#333', marginTop: 2 },
  detalle: { fontSize: 13, color: '#666', marginTop: 2 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  tipo: { fontSize: 12, color: '#666', fontWeight: 'bold' },
  fecha: { fontSize: 12, color: '#888' },
  vacio: { textAlign: 'center', color: '#999', marginTop: 30, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 14, padding: 20, width: '85%', maxWidth: 400, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12, textAlign: 'center' },
  opcion: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  opcionTexto: { fontSize: 15, color: '#333' },
});
