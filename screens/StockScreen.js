import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import config, { getApiUrl } from '../config/config';
import CustomHeader from '../components/CustomHeader';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function StockScreen() {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [codigosDisponibles, setCodigosDisponibles] = useState([]);
  const [stockExistente, setStockExistente] = useState([]);
  const [nombreDuplicado, setNombreDuplicado] = useState(false);
  const [cargandoCodigos, setCargandoCodigos] = useState(false);
  const [nombreBloqueado, setNombreBloqueado] = useState(false);

  // Obtener datos del usuario autenticado
  const { usuario, token } = useContext(AuthContext);

  // Hook para toast
  const { toast, showToast, hideToast } = useToast();

  const cargarCodigosDisponibles = async () => {
    if (!token) {
      showToast('Debes iniciar sesión para cargar códigos', 'error');
      return;
    }

    setCargandoCodigos(true);
    try {
      console.log('Cargando códigos desde:', getApiUrl(`/api/codigos`));
      
      const res = await fetch(getApiUrl('/api/codigos'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Respuesta códigos status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error respuesta códigos:', errorText);
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Códigos cargados:', data.length);
      setCodigosDisponibles(data);
      
      if (data.length === 0) {
        showToast(
          'No hay códigos disponibles. Contacte al administrador para cargar el catálogo.'
        );
      }
    } catch (err) {
      console.error('Error al cargar códigos:', err);
      setCodigosDisponibles([]);
      showToast(
        'No se pudieron cargar los códigos disponibles. Verifique su conexión.\n\nDetalle: ' + err.message,
        'error'
      );
    } finally {
      setCargandoCodigos(false);
    }
  };

  const cargarStockExistente = async () => {
    if (!token || !usuario) {
      return;
    }

    try {
      console.log('Cargando stock personal desde:', getApiUrl(`/api/stock/usuario/${usuario.nombre}`));
      
      const res = await fetch(getApiUrl(`/api/stock/usuario/${usuario.nombre}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Respuesta stock status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error respuesta stock:', errorText);
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Stock personal cargado:', data.length, 'items');
      setStockExistente(data);
    } catch (err) {
      console.error('Error al cargar stock:', err);
      setStockExistente([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (usuario && token) {
        cargarStockExistente();
        cargarCodigosDisponibles();
      }
    }, [usuario, token])
  );

  const handleCambioCodigo = (text) => {
    const codigoLimpio = text.trim();
    setCodigo(codigoLimpio);
    setNombre(''); // Limpiar nombre primero
    setNombreBloqueado(false); // Desbloquear nombre

    // Si ya existe en el stock del usuario, autocompletar nombre y BLOQUEAR
    const existeEnStock = stockExistente.find(item => 
      item.codigo.toLowerCase() === codigoLimpio.toLowerCase()
    );
    
    if (existeEnStock) {
      setNombre(existeEnStock.nombre);
      setNombreBloqueado(true); // BLOQUEAR nombre porque viene del stock
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    // CORREGIDO: La condición estaba invertida
    if (codigoLimpio.length >= 1 && codigosDisponibles.length > 0) {
      const filtrados = codigosDisponibles.filter(c =>
        c.codigo.toLowerCase().includes(codigoLimpio.toLowerCase())
      );
      setSugerencias(filtrados);
      setMostrarSugerencias(filtrados.length > 0);
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
    }

    // Autocompletar si encuentra coincidencia exacta en códigos disponibles
    const codigoEncontrado = codigosDisponibles.find(c => 
      c.codigo.toLowerCase() === codigoLimpio.toLowerCase()
    );
    
    if (codigoEncontrado) {
      setNombre(codigoEncontrado.nombre);
      setNombreBloqueado(true); // BLOQUEAR nombre porque viene de la BD
      setSugerencias([]);
      setMostrarSugerencias(false);
    }
  };

  const handleCambioNombre = (text) => {
    if (nombreBloqueado) {
      // No permitir edición si está bloqueado
      return;
    }
    
    setNombre(text);
    if (text.trim()) {
      const nombreExiste = stockExistente.find(
        item => item.nombre.toLowerCase().trim() === text.toLowerCase().trim() && item.codigo !== codigo
      );
      setNombreDuplicado(!!nombreExiste);
    } else {
      setNombreDuplicado(false);
    }
  };

  const seleccionarSugerencia = (sugerencia) => {
    setCodigo(sugerencia.codigo);
    setNombre(sugerencia.nombre);
    setNombreBloqueado(true); // BLOQUEAR nombre al seleccionar sugerencia
    setMostrarSugerencias(false);
    setSugerencias([]);
  };

  const validarCodigo = (codigoLimpio) => {
    // Verificar si el código existe en la base de datos de códigos disponibles
    const codigoValido = codigosDisponibles.find(c => 
      c.codigo.toLowerCase() === codigoLimpio.toLowerCase()
    );
    
    // O si ya existe en stock del usuario (permitir actualizaciones)
    const existeEnStock = stockExistente.find(item => 
      item.codigo.toLowerCase() === codigoLimpio.toLowerCase()
    );
    
    return codigoValido || existeEnStock;
  };

  const agregarRepuesto = async () => {
    // Ocultar teclado inmediatamente al presionar el botón
    Keyboard.dismiss();

    const codigoLimpio = codigo.trim();
    const nombreLimpio = nombre.trim();
    
    if (!codigoLimpio || !nombreLimpio || !cantidad) {
      showToast('Todos los campos son requeridos', 'error');
      return;
    }

    const cantidadNumerica = Number(cantidad);
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      showToast('La cantidad debe ser mayor a 0', 'error');
      return;
    }

    // Validar que el código existe en la base de datos
    if (!validarCodigo(codigoLimpio)) {
      showToast(
        'El código ingresado no existe en el catálogo. Verifique el código o contacte al administrador.',
        'error'
      );
      return;
    }

    // No mostrar Alert para suma automática, directamente enviar
    const payload = { 
      codigo: codigoLimpio, 
      nombre: nombreLimpio, 
      cantidad: cantidadNumerica
    };
    
    try {
      console.log('Enviando repuesto a:', `${config.API_URL}/api/stock/personal`);
      console.log('Payload:', payload);
      
      const res = await fetch(getApiUrl('/api/stock/personal'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Respuesta agregar status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error respuesta agregar:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          showToast(errorJson.message || errorJson.error || 'No se pudo agregar el repuesto', 'error');
        } catch {
          showToast(`Error del servidor (${res.status}): ${errorText}`, 'error');
        }
        return;
      }
      
      const data = await res.json();
      console.log('Respuesta exitosa:', data);
      
      // Mostrar mensaje apropiado según la operación
      if (data.operacion === 'suma') {
        showToast('Stock actualizado exitosamente');
      } else {
        showToast('Repuesto agregado exitosamente');
      }
      
      // Limpiar formulario
      setCodigo('');
      setNombre('');
      setCantidad('');
      setNombreBloqueado(false);
      
      // Recargar stock
      cargarStockExistente();
    } catch (err) {
      console.error('Error al agregar repuesto:', err);
      showToast('Error de conexión. Intente nuevamente.\n\nDetalle: ' + err.message, 'error');
    }
  };

  // Mostrar mensaje si no está autenticado
  if (!usuario || !token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CustomHeader />
        <View style={styles.container}>
          <Text style={styles.errorText}>Por favor inicia sesión para acceder a tu stock personal</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader />
      <View style={styles.container}>
        <Text style={styles.titulo}>Agregar/Actualizar Repuesto</Text>
        
        <TextInput
          placeholder={cargandoCodigos ? "Cargando códigos..." : "Código"}
          style={styles.input}
          value={codigo}
          onChangeText={handleCambioCodigo}
          editable={!cargandoCodigos}
        />

        {/* Lista de sugerencias */}
        {mostrarSugerencias && sugerencias.length > 0 && (
          <View style={styles.sugerenciasContainer}>
            <ScrollView 
              style={styles.sugerenciasScroll}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {sugerencias.map((sug, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.sugerencia,
                    idx === sugerencias.length - 1 && styles.ultimaSugerencia
                  ]}
                  onPress={() => seleccionarSugerencia(sug)}
                >
                  <Text style={styles.codigoSugerencia}>{sug.codigo}</Text>
                  <Text style={styles.nombreSugerencia}>{sug.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <TextInput
          placeholder="Nombre del repuesto"
          style={[
            styles.input, 
            nombreDuplicado && styles.inputError,
            mostrarSugerencias && styles.inputConSugerencias,
            nombreBloqueado && styles.inputBloqueado
          ]}
          value={nombre}
          onChangeText={handleCambioNombre}
          editable={!nombreBloqueado}
        />
        
        {nombreDuplicado && (
          <Text style={styles.errorText}>Ya tienes un repuesto con este nombre</Text>
        )}

        <TextInput
          placeholder="Cantidad"
          style={[
            styles.input,
            mostrarSugerencias && styles.inputConSugerencias
          ]}
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
        />

        <TouchableOpacity 
          style={[styles.boton, cargandoCodigos && styles.botonDeshabilitado]} 
          onPress={agregarRepuesto}
          disabled={cargandoCodigos}
        >
          <Text style={styles.textoBoton}>
            {cargandoCodigos ? 'CARGANDO...' : 'AGREGAR A MI STOCK'}
          </Text>
        </TouchableOpacity>

        {codigosDisponibles.length === 0 && !cargandoCodigos && (
          <Text style={styles.infoText}>
            No hay códigos disponibles. Contacte al administrador para cargar el catálogo.
          </Text>
        )}
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
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  titulo: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    color: '#333' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc',
    marginBottom: 10, 
    padding: 12, 
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  inputConSugerencias: {
    zIndex: 1,
    opacity: 0.7,
  },
  inputError: { 
    borderColor: 'red', 
    borderWidth: 2 
  },
  inputBloqueado: {
    backgroundColor: '#f5f5f5',
    borderColor: '#999',
    color: '#666'
  },
  nombreBloqueadoText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: -5,
    marginBottom: 10,
    textAlign: 'center'
  },
  boton: { 
    backgroundColor: '#60A5FA', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center',
    marginTop: 10 
  },
  botonDeshabilitado: { 
    backgroundColor: '#ccc' 
  },
  textoBoton: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sugerenciasContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    maxHeight: 250,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    position: 'relative',
    zIndex: 1000,
  },
  sugerenciasScroll: {
    maxHeight: 240,
  },
  sugerencia: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  ultimaSugerencia: {
    borderBottomWidth: 0,
  },
  codigoSugerencia: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333'
  },
  nombreSugerencia: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -5,
    marginBottom: 10,
    textAlign: 'center'
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic'
  }
});