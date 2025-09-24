import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Platform, 
  TextInput, 
  Pressable,
  TouchableOpacity,
  Keyboard,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
//import config from '../config/config';
import config, { getApiUrl } from '../config/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomHeader from '../components/CustomHeader';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function HistorialScreen() {
  const [usos, setUsos] = useState([]);
  const [todosLosUsos, setTodosLosUsos] = useState([]);
  
  // Obtener datos del usuario autenticado
  const { usuario, token } = useContext(AuthContext);

  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFin, setMostrarFin] = useState(false);

  // Hook para toast
  const { toast, showToast, hideToast } = useToast();

  // Estados para modal de edición
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [usoEditando, setUsoEditando] = useState(null);
  const [nuevoTipoConsumo, setNuevoTipoConsumo] = useState('');

  // Función para mostrar fecha formateada
  const mostrarFecha = (fecha) => {
    if (!fecha) return null;
    return fecha.toLocaleDateString();
  };

  // Filtros adicionales
  const [filtroLocal, setFiltroLocal] = useState('');
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroTipoConsumo, setFiltroTipoConsumo] = useState('');
  const [localesDisponibles, setLocalesDisponibles] = useState([]);
  const [codigosDisponibles, setCodigosDisponibles] = useState([]);

  const cargarUsos = () => {
    if (usuario && token) {
      //fetch(`${config.API_URL}/api/usos/usuario/${usuario.nombre}`, {
        fetch(getApiUrl(`/api/usos/usuario/${usuario.nombre}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          setUsos(data);
          setTodosLosUsos(data);
          
          // Extraer locales y códigos únicos para los filtros del usuario actual
          const localesUnicos = [...new Set(data.map(item => item.lugarUso).filter(Boolean))];
          const codigosUnicos = [...new Set(data.map(item => item.codigo).filter(Boolean))];
          
          setLocalesDisponibles(localesUnicos.sort());
          setCodigosDisponibles(codigosUnicos.sort());
        })
        .catch(error => {
          console.error('Error al obtener los usos:', error);
          showToast('Error. No se pudieron cargar tus usos. Verifica tu conexión.', 'error');
        });
    }
  };

  useEffect(() => {
    cargarUsos();
  }, [usuario, token]);

  // Función para editar tipo de consumo
  const editarTipoConsumo = (uso) => {
    setUsoEditando(uso);
    setNuevoTipoConsumo(uso.tipoConsumo || 'Consumo');
    setModalEditarVisible(true);
  };

  const confirmarEdicion = async () => {
    if (!usoEditando || !nuevoTipoConsumo) {
      showToast('Error en los datos de edición', 'error');
      return;
    }

    try {
      //const response = await fetch(`${config.API_URL}/api/usos/${usoEditando._id}/editar-tipo`, {
        const response = await fetch(getApiUrl(`/api/usos/${usoEditando._id}/editar-tipo`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipoConsumo: nuevoTipoConsumo
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al editar');
      }

      const resultado = await response.json();
      
      showToast(`Tipo actualizado de "${resultado.uso.tipoAnterior}" a "${resultado.uso.tipoNuevo}"`);
      
      // Recargar la lista de usos
      cargarUsos();
      
      // Cerrar modal
      setModalEditarVisible(false);
      setUsoEditando(null);

    } catch (error) {
      console.error('Error al editar tipo de consumo:', error);
      showToast('Error al editar tipo de consumo', 'error');
    }
  };

  // Un solo botón que envía ambos reportes
  const enviarReportesSeparados = async () => {
    if (!usuario || !token) {
      showToast('Debes estar autenticado para enviar reportes', 'error');
      return;
    }

    try {
      showToast('Enviando reportes...');

      // Enviar ambos reportes en paralelo
      const [reporteConsumo, reporteFacturable] = await Promise.all([
        //fetch(`${config.API_URL}/api/correo/personal`, {
        fetch(getApiUrl('/api/correo/personal'), {

          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            destinatario: usuario.correo,
            usuario: usuario.nombre,
            tipoConsumo: 'Consumo'
          })
        }),
        //fetch(`${config.API_URL}/api/correo/personal`, {
        fetch(getApiUrl('/api/correo/personal'), {

          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            destinatario: usuario.correo,
            usuario: usuario.nombre,
            tipoConsumo: 'Facturable'
          })
        })
      ]);

      const dataConsumo = await reporteConsumo.json();
      const dataFacturable = await reporteFacturable.json();

      if (reporteConsumo.ok && reporteFacturable.ok) {
        const totalRegistros = dataConsumo.registros + dataFacturable.registros;
        if (totalRegistros > 0) {
          showToast(`Reportes enviados: ${dataConsumo.registros} Consumo, ${dataFacturable.registros} Facturable`);
        } else {
          showToast('No hay registros nuevos para enviar');
        }
      } else if (reporteConsumo.ok) {
        showToast(`Reporte de Consumo enviado (${dataConsumo.registros} registros). Error en Facturable`, 'error');
      } else if (reporteFacturable.ok) {
        showToast(`Reporte Facturable enviado (${dataFacturable.registros} registros). Error en Consumo`, 'error');
      } else {
        showToast('Error al enviar ambos reportes', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al enviar reportes', 'error');
    }
  };

  const aplicarFiltro = () => {
    let usosFiltrados = todosLosUsos;

    // Filtro por fechas
    if (fechaInicio && fechaFin) {
      const desdeInicio = new Date(fechaInicio);
      desdeInicio.setHours(0, 0, 0, 0);

      const hastaFin = new Date(fechaFin);
      hastaFin.setHours(23, 59, 59, 999);

      usosFiltrados = usosFiltrados.filter(item => {
        const fechaUso = new Date(item.fecha);
        return fechaUso >= desdeInicio && fechaUso <= hastaFin;
      });
    }

    // Filtro por local
    if (filtroLocal) {
      usosFiltrados = usosFiltrados.filter(item => 
        item.lugarUso && item.lugarUso.toLowerCase().includes(filtroLocal.toLowerCase())
      );
    }

    // Filtro por código
    if (filtroCodigo) {
      usosFiltrados = usosFiltrados.filter(item => 
        item.codigo && item.codigo.toLowerCase().includes(filtroCodigo.toLowerCase())
      );
    }

    // Filtro por tipo de consumo
    if (filtroTipoConsumo) {
      usosFiltrados = usosFiltrados.filter(item => 
        item.tipoConsumo && item.tipoConsumo.toLowerCase().includes(filtroTipoConsumo.toLowerCase())
      );
    }

    setUsos(usosFiltrados);
  };

  const limpiarFiltros = () => {
    setFechaInicio(null);
    setFechaFin(null);
    setFiltroLocal('');
    setFiltroCodigo('');
    setFiltroTipoConsumo('');
    setUsos(todosLosUsos);
  };

  // Función para formatear fecha sin hora
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.headerItem}>
        <Text style={styles.titulo}>{item.codigo || 'Sin código'}</Text>
        <TouchableOpacity 
            style={styles.botonMenu}
            onPress={() => editarTipoConsumo(item)}
        >
            <Text style={styles.textoMenu}>⋮</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.nombre}>Nombre: {item.nombre || 'Sin nombre'}</Text>
      <Text>Cliente: {item.cliente || 'N/A'}</Text>
      <Text>Local: {item.lugarUso || 'N/A'}</Text>
      <Text>Dispositivo: {item.maquina || 'N/A'}</Text>
      <Text>Cantidad: {item.cantidad || 'N/A'}</Text>
      <Text style={styles.tipoConsumo}>Tipo: {item.tipoConsumo || 'N/A'}</Text>
      <Text>Fecha: {formatearFecha(item.fecha)}</Text>
      {item.enviadoManual && (
        <Text style={styles.enviado}>✓ Enviado en reporte</Text>
      )}
    </View>
  );

  // Mostrar mensaje si no está autenticado
  if (!usuario || !token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CustomHeader />
        <View style={styles.container}>
          <Text style={styles.errorText}>Por favor inicia sesión para ver tu historial personal</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader />
      <View style={styles.container}>
        <Text style={styles.encabezado}>Historial de Usos</Text>

        {/* Filtros compactos */}
        <TextInput
          style={styles.inputFiltro}
          placeholder="Filtrar por local"
          value={filtroLocal}
          onChangeText={setFiltroLocal}
        />

        <TextInput
          style={styles.inputFiltro}
          placeholder="Filtrar por código"
          value={filtroCodigo}
          onChangeText={setFiltroCodigo}
        />

        <TextInput
          style={styles.inputFiltro}
          placeholder="Filtrar por tipo (Consumo/Facturable)"
          value={filtroTipoConsumo}
          onChangeText={setFiltroTipoConsumo}
        />

        {/* Filtros de fechas */}
        <View style={styles.fechas}>
          <Pressable onPress={() => setMostrarInicio(true)} style={styles.fechaBtn}>
            <Text style={styles.fechaTexto}>
            📅 Desde: {mostrarFecha(fechaInicio) || 'Seleccione'}
            </Text>
          </Pressable>
          <Pressable onPress={() => setMostrarFin(true)} style={styles.fechaBtn}>
            <Text style={styles.fechaTexto}>
            📅 Hasta: {mostrarFecha(fechaFin) || 'Seleccione'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.botonesContainer}>
          <TouchableOpacity style={styles.botonFiltrar} onPress={aplicarFiltro}>
            <Text style={styles.textoBoton}>FILTRAR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.botonLimpiar} onPress={limpiarFiltros}>
            <Text style={styles.textoBotonSecundario}>LIMPIAR</Text>
          </TouchableOpacity>
        </View>

        {mostrarInicio && (
          <DateTimePicker
            value={fechaInicio || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setMostrarInicio(Platform.OS === 'ios');
              if (date) setFechaInicio(date);
            }}
          />
        )}
        {mostrarFin && (
          <DateTimePicker
            value={fechaFin || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setMostrarFin(Platform.OS === 'ios');
              if (date) setFechaFin(date);
            }}
          />
        )}

        <FlatList
          data={usos}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes registros de usos aún</Text>
              <Text style={styles.emptySubtext}>Los usos que registres aparecerán aquí</Text>
            </View>
          )}
        />

        {/* UN SOLO BOTÓN QUE ENVÍA AMBOS REPORTES */}
        <TouchableOpacity style={styles.botonCorreo} onPress={enviarReportesSeparados}>
          <Text style={styles.textoBoton}>ENVIAR REPORTE</Text>
        </TouchableOpacity>

        {/* Modal para editar tipo de consumo */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalEditarVisible}
          onRequestClose={() => setModalEditarVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Tipo de Consumo</Text>
              <Text style={styles.modalSubtitle}>
                {usoEditando?.codigo}
              </Text>
              
              <TouchableOpacity 
                style={[styles.modalButton, nuevoTipoConsumo === 'Consumo' && styles.modalButtonSelected]}
                onPress={() => setNuevoTipoConsumo('Consumo')}
              >
                <Text style={[styles.modalButtonText, nuevoTipoConsumo === 'Consumo' ? styles.textSelected : styles.textUnselected]}>CONSUMO</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, nuevoTipoConsumo === 'Facturable' && styles.modalButtonSelected]}
                onPress={() => setNuevoTipoConsumo('Facturable')}
              >
                <Text style={[styles.modalButtonText, nuevoTipoConsumo === 'Facturable' ? styles.textSelected : styles.textUnselected]}>FACTURABLE</Text>
              </TouchableOpacity>
              
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setModalEditarVisible(false)}
                >
                  <Text style={styles.modalButtonTextCancel}>CANCELAR</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={confirmarEdicion}
                >
                  <Text style={styles.modalButtonText}>GUARDAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* Componente Toast */}
      <Toast 
        message={toast.message}
        visible={toast.visible}
        onHide={hideToast}
        type={toast.type}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  encabezado: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 5,
    color: '#333'
  },
  item: { 
    backgroundColor: '#fff', 
    padding: 15, 
    marginBottom: 10, 
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  titulo: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  botonMenu: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  textoMenu: {
    fontSize: 22,
    color: '#666',
  },
  nombre: {
    fontSize: 14,
    marginBottom: 3,
    color: '#333'
  },
  tipoConsumo: {
    fontSize: 14,
    marginBottom: 3,
    color: '#666',
    fontWeight: 'bold'
  },
  enviado: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 5,
  },
  inputFiltro: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  fechas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fechaBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginHorizontal: 5,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  fechaTexto: {
    textAlign: 'center',
    flexWrap: 'nowrap',
    fontSize: 12,
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  botonFiltrar: {
    flex: 1,
    backgroundColor: '#60A5FA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  botonLimpiar: {
    flex: 1,
    backgroundColor: '#888',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  botonCorreo: {
    backgroundColor: '#60A5FA',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  textoBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoBotonSecundario: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Estilos para modal de edición
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
    fontWeight: '500',
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  modalButtonSelected: {
    backgroundColor: '#60A5FA',
    borderColor: '#60A5FA',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButtonConfirm: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 10,
  },
  modalButtonCancel: {
    backgroundColor: '#C0C0C0',
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 10,
  },
  modalButtonText: {
    color:'#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textSelected: {
    color: '#fff',
  },
  textUnselected: {
    color: '#666',
  },
  modalButtonTextCancel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});