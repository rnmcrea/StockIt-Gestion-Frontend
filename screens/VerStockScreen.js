import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  Platform, Pressable, TouchableOpacity, Modal, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
//import config from '../config/config';
import config, { getApiUrl } from '../config/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomHeader from '../components/CustomHeader';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { Ionicons } from '@expo/vector-icons';

export default function VerStockScreen() {
  const [stock, setStock] = useState([]);
  const [todoElStock, setTodoElStock] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFin, setMostrarFin] = useState(false);

  // Hook para toast
  const { toast, showToast, hideToast } = useToast();
  
  // Estados para modal de cantidad personalizada
  const [modalCantidadVisible, setModalCantidadVisible] = useState(false);
  const [cantidadInput, setCantidadInput] = useState('');
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [usuarioDestino, setUsuarioDestino] = useState('');
  
  // Estados para modales personalizados
  const [modalMenuVisible, setModalMenuVisible] = useState(false);
  const [modalTransferirVisible, setModalTransferirVisible] = useState(false);
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  
  // Estados para usuarios desde MongoDB
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

  // Obtener datos del usuario autenticado
  const { usuario, token } = useContext(AuthContext);

  const mostrarFecha = (fecha) => fecha ? fecha.toLocaleDateString() : null;

  // Cargar usuarios desde MongoDB
  const cargarUsuarios = async () => {
    if (!token) return;
    
    setCargandoUsuarios(true);
    try {
      //const res = await fetch(`${config.API_URL}/api/usuarios`, {
      const res = await fetch(getApiUrl('/api/usuarios'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      // Filtrar para no mostrar al usuario actual en las transferencias
      const otrosUsuarios = data.filter(u => u.nombre !== usuario.nombre);
      setUsuarios(otrosUsuarios);
      
      console.log(`Usuarios cargados para transferencias: ${otrosUsuarios.length}`);
    } catch (err) {
      console.error('Error al cargar usuarios:', err.message);
      setUsuarios([]);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  // Cargar stock con mejor manejo de errores
  const cargarStock = async () => {
    if (!usuario || !token) return;

    try {
      console.log('Cargando stock desde:', `${config.API_URL}/api/stock/usuario/${usuario.nombre}`);
      
      //const res = await fetch(`${config.API_URL}/api/stock/usuario/${usuario.nombre}`, {
      const res = await fetch(getApiUrl(`/api/stock/usuario/${usuario.nombre}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Respuesta stock status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error en respuesta stock:', errorText);
        showToast('✘ Error al obtener tu stock', 'error');
        return;
      }
      
      const data = await res.json();
      console.log('Stock cargado:', data.length, 'items');
      
      // Solo mostrar repuestos con cantidad > 0 del usuario actual
      const filtrado = data.filter(item => item.cantidad > 0);
      
      setStock(filtrado);
      setTodoElStock(filtrado);
      
    } catch (err) {
      console.error('Error al obtener stock:', err);
      showToast('✘ No se pudo conectar al servidor', 'error');
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (usuario && token) {
        cargarStock();
        cargarUsuarios();
      }
    }, [usuario, token])
  );

  const aplicarFiltros = () => {
    Keyboard.dismiss();
    let stockFiltrado = todoElStock;
    if (busqueda.trim()) {
      stockFiltrado = stockFiltrado.filter(item =>
        item.codigo.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    if (fechaInicio && fechaFin) {
      const desde = new Date(fechaInicio); desde.setHours(0,0,0,0);
      const hasta = new Date(fechaFin); hasta.setHours(23,59,59,999);
      stockFiltrado = stockFiltrado.filter(item => {
        const f = new Date(item.createdAt);
        return f >= desde && f <= hasta;
      });
    }
    setStock(stockFiltrado);
    showToast('Filtros aplicados correctamente');
  };

  const limpiarFiltros = () => {
    Keyboard.dismiss();
    setFechaInicio(null); 
    setFechaFin(null); 
    setBusqueda('');
    setStock(todoElStock);
    showToast('Filtros limpiados');
  };

  // Eliminar repuesto con mejor manejo
  const eliminarRepuesto = async (id) => {
    Keyboard.dismiss();

    try {
      const item = stock.find(i => i._id === id);
      if (!item) {
        showToast('✘ Repuesto no encontrado', 'error');
        return;
      }

      console.log('Eliminando repuesto:', id, 'cantidad actual:', item.cantidad);

      //const res = await fetch(`${config.API_URL}/api/stock/${id}/remove`, {
      const res = await fetch(getApiUrl(`/api/stock/${id}/remove`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Respuesta eliminar status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error en respuesta eliminar:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          showToast(errorJson.error || errorJson.message || 'Error al eliminar repuesto', 'error');
        } catch {
          showToast(`✘ Error del servidor (${res.status})`, 'error');
        }
        return;
      }

      const data = await res.json();
      console.log('Respuesta eliminar exitosa:', data);

      // Actualizar estado local inmediatamente
      if (data.eliminado) {
        // El item fue eliminado completamente
        const stockActualizado = stock.filter(item => item._id !== id);
        const todoStockActualizado = todoElStock.filter(item => item._id !== id);
        setStock(stockActualizado);
        setTodoElStock(todoStockActualizado);
        showToast('Repuesto eliminado completamente');
      } else {
        // Solo se redujo la cantidad - ACTUALIZAR EN TIEMPO REAL
        const stockActualizado = stock.map(item =>
          item._id === id ? { ...item, cantidad: data.item.cantidad } : item
        );
        const todoStockActualizado = todoElStock.map(item =>
          item._id === id ? { ...item, cantidad: data.item.cantidad } : item
        );
        
        // Si después de la reducción queda en 0, remover de la lista
        const stockFiltrado = stockActualizado.filter(item => item.cantidad > 0);
        const todoStockFiltrado = todoStockActualizado.filter(item => item.cantidad > 0);
        
        setStock(stockFiltrado);
        setTodoElStock(todoStockFiltrado);
        showToast(`✔ Cantidad reducida a ${data.item.cantidad}`);
      }
    } catch (err) {
      console.error('Error eliminando:', err);
      showToast('✘ No se pudo conectar al servidor', 'error');
    }
  };

  // Transferir con mejor manejo
  const realizarTransferencia = async (id, cantidadATransferir, usuarioDestino) => {
    Keyboard.dismiss();
    
    try {
      const item = stock.find(i => i._id === id);
      if (!item) {
        showToast('✘ Repuesto no encontrado', 'error');
        return;
      }

      console.log('Realizando transferencia:', {
        codigo: item.codigo,
        cantidadATransferir,
        origen: usuario.nombre,
        destino: usuarioDestino
      });
  
      //const res = await fetch(`${config.API_URL}/api/stock/transferir-personal`, {
      const res = await fetch(getApiUrl('/api/stock/transferir-personal'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          codigo: item.codigo,
          cantidadTransferir: cantidadATransferir, 
          usuarioOrigen: usuario.nombre,
          usuarioDestino: usuarioDestino
        })
      });
      
      console.log('Respuesta transferencia status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error en respuesta transferencia:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          showToast(errorJson.message || errorJson.error || 'Error en transferencia', 'error');
        } catch {
          showToast(`✘ Error del servidor (${res.status})`, 'error');
        }
        return;
      }
      
      const data = await res.json();
      console.log('Transferencia exitosa:', data);
  
      // Actualizar estado local inmediatamente
      if (data.stockOrigen.cantidad === 0) {
        // El item fue eliminado completamente del origen
        const stockActualizado = stock.filter(item => item._id !== id);
        const todoStockActualizado = todoElStock.filter(item => item._id !== id);
        setStock(stockActualizado);
        setTodoElStock(todoStockActualizado);
      } else {
        // Solo se redujo la cantidad en el origen
        const stockActualizado = stock.map(item =>
          item._id === id ? { ...item, cantidad: data.stockOrigen.cantidad } : item
        );
        const todoStockActualizado = todoElStock.map(item =>
          item._id === id ? { ...item, cantidad: data.stockOrigen.cantidad } : item
        );
        setStock(stockActualizado);
        setTodoElStock(todoStockActualizado);
      }
      
      showToast(`Transferencia realizada - ${cantidadATransferir} unidades`);
    } catch (err) {
      console.error('Error en transferencia:', err);
      showToast('✘ No se pudo conectar al servidor', 'error');
    }
  };

  const abrirModalCantidad = (item, usuario) => {
    setItemSeleccionado(item);
    setUsuarioDestino(usuario);
    setCantidadInput('');
    setModalCantidadVisible(true);
  };

  const confirmarCantidadPersonalizada = () => {
    Keyboard.dismiss();
    
    const cantidad = parseInt(cantidadInput);
    if (isNaN(cantidad) || cantidad <= 0) {
      showToast('✘ Ingrese una cantidad válida', 'error');
      return;
    }
    if (cantidad > itemSeleccionado.cantidad) {
      showToast(`✘ Cantidad máxima disponible: ${itemSeleccionado.cantidad}`, 'error');
      return;
    }
    
    setModalCantidadVisible(false);
    realizarTransferencia(itemSeleccionado._id, cantidad, usuarioDestino);
  };

  const preguntarCantidad = (item, usuarioDestino) => {
    if (item.cantidad === 1) {
      // Si solo hay 1, transferir directamente sin modal
      realizarTransferencia(item._id, 1, usuarioDestino);
      return;
    }

    // Si hay más de 1, ir directamente al modal con teclado numérico
    abrirModalCantidad(item, usuarioDestino);
  };

  // Abrir modal de menú de acciones
  const abrirMenu = (item) => {
    setItemSeleccionado(item);
    setModalMenuVisible(true);
  };

  // Abrir modal de transferencia
  const abrirModalTransferir = () => {
    setModalMenuVisible(false);
    
    if (cargandoUsuarios) {
      showToast('Cargando usuarios...', 'error');
      return;
    }

    if (usuarios.length === 0) {
      showToast('No hay usuarios disponibles para transferir', 'error');
      return;
    }
    
    setModalTransferirVisible(true);
  };

  // Abrir modal de confirmación de eliminación
  const abrirModalEliminar = () => {
    setModalMenuVisible(false);
    setModalEliminarVisible(true);
  };

  // Confirmar eliminación
  const confirmarEliminacion = () => {
    setModalEliminarVisible(false);
    eliminarRepuesto(itemSeleccionado._id);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.codigo}>{item.codigo}</Text>
        <TouchableOpacity onPress={() => abrirMenu(item)}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>
      <Text>Nombre: {item.nombre}</Text>
      <Text>Cantidad: {item.cantidad}</Text>
      <Text style={styles.fecha}>
        Ingresado: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  // Mostrar mensaje si no está autenticado
  if (!usuario || !token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CustomHeader />
        <View style={styles.container}>
          <Text style={styles.errorText}>Por favor inicia sesión para ver tu stock personal</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader />
      <View style={styles.container}>
        <Text style={styles.titulo}>Mi Stock Personal</Text>

        <TextInput
          style={styles.input}
          placeholder="Buscar por código"
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <View style={styles.fechas}>
          <Pressable onPress={() => setMostrarInicio(true)} style={styles.fechaBtn}>
            <Text style={styles.fechaTexto}>📅 Desde: {mostrarFecha(fechaInicio) || 'Seleccione'}</Text>
          </Pressable>
          <Pressable onPress={() => setMostrarFin(true)} style={styles.fechaBtn}>
            <Text style={styles.fechaTexto}>📅 Hasta: {mostrarFecha(fechaFin) || 'Seleccione'}</Text>
          </Pressable>
        </View>

        <View style={styles.botonesContainer}>
          <TouchableOpacity style={styles.botonFiltrar} onPress={aplicarFiltros}>
            <Text style={styles.textoBoton}>FILTRAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonLimpiar} onPress={limpiarFiltros}>
            <Text style={styles.textoBotonSecundario}>LIMPIAR</Text>
          </TouchableOpacity>
        </View>

        {mostrarInicio && (
          <DateTimePicker value={fechaInicio || new Date()} mode="date"
            display="default"
            onChange={(event, date) => { setMostrarInicio(Platform.OS === 'ios'); if (date) setFechaInicio(date); }}
          />
        )}
        {mostrarFin && (
          <DateTimePicker value={fechaFin || new Date()} mode="date"
            display="default"
            onChange={(event, date) => { setMostrarFin(Platform.OS === 'ios'); if (date) setFechaFin(date); }}
          />
        )}

        <FlatList 
          data={stock} 
          keyExtractor={(item) => item._id} 
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes stock disponible</Text>
              <Text style={styles.emptySubtext}>Los repuestos que agregues aparecerán aquí</Text>
            </View>
          )}
        />

        {/* Modal de menú de acciones */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalMenuVisible}
          onRequestClose={() => setModalMenuVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>¿Qué deseas hacer?</Text>
              <Text style={styles.modalSubtitle}>
                {itemSeleccionado?.codigo}
              </Text>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonTransfer]}
                onPress={abrirModalTransferir}
              >
                <Text style={styles.modalButtonText}>TRANSFERIR</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={abrirModalEliminar}
              >
                <Text style={styles.modalButtonText}>ELIMINAR</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalMenuVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de transferencia */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalTransferirVisible}
          onRequestClose={() => setModalTransferirVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Transferir repuesto</Text>
              <Text style={styles.modalSubtitle}>
                {itemSeleccionado?.codigo}
              </Text>
              <Text style={styles.modalLabel}>
                Cantidad disponible: {itemSeleccionado?.cantidad}
              </Text>
              <Text style={styles.modalLabel}>
                Seleccione usuario destino:
              </Text>
              
              {usuarios.map((usuarioItem) => (
                <TouchableOpacity 
                  key={usuarioItem._id}
                  style={[styles.modalButton, styles.modalButtonUser]}
                  onPress={() => {
                    setModalTransferirVisible(false);
                    preguntarCantidad(itemSeleccionado, usuarioItem.nombre);
                  }}
                >
                  <Text style={styles.modalButtonText}>
                   <Ionicons name="person" size={17} color="white" />    {usuarioItem.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {usuarios.length < 2 && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonRefresh]}
                  onPress={() => {
                    cargarUsuarios();
                    showToast('Usuarios recargados');
                  }}
                >
                  <Text style={styles.modalButtonText}>🔄 Recargar usuarios</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalTransferirVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de confirmación de eliminación */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalEliminarVisible}
          onRequestClose={() => setModalEliminarVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirmar eliminación</Text>
              <Text style={styles.modalSubtitle}>
                {itemSeleccionado?.codigo}
              </Text>
              <Text style={styles.modalLabel}>
                ¿Estás seguro de que deseas eliminar este repuesto?
              </Text>
              <Text style={styles.modalLabel}>
                Cantidad actual: {itemSeleccionado?.cantidad}
              </Text>
              
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonCancel, { flex: 1, marginRight: 10 }]}
                  onPress={() => setModalEliminarVisible(false)}
                >
                  <Text style={styles.modalButtonTextCancel}>NO</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonDelete, { flex: 1, marginLeft: 10 }]}
                  onPress={confirmarEliminacion}
                >
                  <Text style={styles.modalButtonText}>SI</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para cantidad personalizada */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalCantidadVisible}
          onRequestClose={() => {
            Keyboard.dismiss();
            setModalCantidadVisible(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cantidad personalizada</Text>
              <Text style={styles.modalSubtitle}>
                {itemSeleccionado?.codigo}
              </Text>
              <Text style={styles.modalLabel}>
                Disponible: {itemSeleccionado?.cantidad} | Transferir a: {usuarioDestino}
              </Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder={`Cantidad (máx. ${itemSeleccionado?.cantidad || 0})`}
                value={cantidadInput}
                onChangeText={setCantidadInput}
                keyboardType="numeric"
                autoFocus={true}
                selectTextOnFocus={true}
              />
              
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonCancel, { flex: 1, marginRight: 10 }]}
                  onPress={() => {
                    Keyboard.dismiss();
                    setModalCantidadVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonTextCancel}>CANCELAR</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonConfirm, { flex: 1, marginLeft: 10 }]}
                  onPress={confirmarCantidadPersonalizada}
                >
                  <Text style={styles.modalButtonText}>TRANSFERIR</Text>
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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, backgroundColor: '#fff' },
  fechas: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  fechaBtn: { flex: 1, padding: 10, backgroundColor: '#fff', borderRadius: 5, marginHorizontal: 5, justifyContent: 'center' },
  fechaTexto: { textAlign: 'center', flexWrap: 'nowrap', fontSize: 12 },
  botonesContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 15 },
  botonFiltrar: { flex: 1, backgroundColor: '#60A5FA', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  botonLimpiar: { flex: 1, backgroundColor: '#C0C0C0', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  textoBoton: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  textoBotonSecundario: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  item: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8 },
  codigo: { fontWeight: 'bold', fontSize: 16 },
  fecha: { fontSize: 12, color: '#555', marginTop: 5 },
  menuIcon: { fontSize: 22, paddingHorizontal: 8 },
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
  // Estilos de modales personalizados
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
    marginBottom: 8,
    color: '#000',
    fontWeight: '500',
  },
  modalLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    color: '#888',
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButtonTransfer: {
    backgroundColor: '#60A5FA',
  },
  modalButtonDelete: {
    backgroundColor: '#f44336',
  },
  modalButtonUser: {
    backgroundColor: '#4CAF50',
  },
  modalButtonRefresh: {
    backgroundColor: '#FF9800',
  },
  modalButtonConfirm: {
    backgroundColor: '#60A5FA',
  },
  modalButtonCancel: {
    backgroundColor: '#C0C0C0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalButtonTextCancel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});