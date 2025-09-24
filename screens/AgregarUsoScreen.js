import React, { useState, useEffect, useCallback, useContext } from 'react';
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

const AgregarUsoScreen = () => {
  const [codigo, setCodigo] = useState('');
  const [cliente, setCliente] = useState('');
  const [maquina, setMaquina] = useState('');
  const [lugarUso, setLugarUso] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [nombreRepuesto, setNombreRepuesto] = useState('');
  const [tipoConsumo, setTipoConsumo] = useState('');

  const [stockDisponible, setStockDisponible] = useState([]);
  const [sugerenciasCodigo, setSugerenciasCodigo] = useState([]);
  const [sugerenciasMaquina, setSugerenciasMaquina] = useState([]);
  const [sugerenciasCliente, setSugerenciasCliente] = useState([]);
  const [sugerenciasTipoConsumo, setSugerenciasTipoConsumo] = useState([]);

  const [mostrarSugCodigo, setMostrarSugCodigo] = useState(false);
  const [mostrarSugMaquina, setMostrarSugMaquina] = useState(false);
  const [mostrarSugCliente, setMostrarSugCliente] = useState(false);
  const [mostrarSugTipoConsumo, setMostrarSugTipoConsumo] = useState(false); 

  const opcionesMaquina = ['Moneda', 'Billete'];
  const opcionesCliente = ['Walmart', 'Loomis', 'Monticello', 'Enjoy', 'BCI Talca', 'BCI Arica'];
  const opcionesTipoConsumo = ['Consumo', 'Facturable']; 

  // Obtener datos del usuario autenticado
  const { usuario, token } = useContext(AuthContext);

  // Hook para toast
  const { toast, showToast, hideToast } = useToast();

  // Cargar stock personal del usuario autenticado
  useFocusEffect(
    useCallback(() => {
      const cargarStock = async () => {
        if (!usuario || !token) {
          console.log('Sin usuario o token para cargar stock');
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
          
          if (!res.ok) {
            console.error('Error al cargar stock personal:', res.status);
            showToast('Error al cargar tu stock personal', 'error');
            return;
          }
          
          const data = await res.json();
          // Solo mostrar repuestos con cantidad > 0
          const disponibles = data.filter(item => item.cantidad > 0);
          setStockDisponible(disponibles);
          console.log('Stock personal recargado en AgregarUso:', disponibles.length, 'items');
        } catch (err) {
          console.error('Error al cargar stock personal:', err);
          showToast('No se pudo conectar al servidor', 'error');
        }
      };

      cargarStock();
    }, [usuario, token])
  );

  const handleCodigoChange = (text) => {
    setCodigo(text);
    setNombreRepuesto('');
    
    // CORREGIDO: La condición estaba invertida
    if (text.length < 1) {
      setSugerenciasCodigo([]);
      setMostrarSugCodigo(false);
      return;
    }

    const sugerencias = stockDisponible.filter((item) =>
      item.codigo.toLowerCase().includes(text.toLowerCase())
    );
    setSugerenciasCodigo(sugerencias);
    setMostrarSugCodigo(sugerencias.length > 0);
    
    // Cerrar otras sugerencias
    setMostrarSugMaquina(false);
    setMostrarSugCliente(false);
    setMostrarSugTipoConsumo(false);
  };

  const seleccionarCodigo = (codigoSel, nombreSel) => {
    Keyboard.dismiss();
    setCodigo(codigoSel);
    setNombreRepuesto(nombreSel);
    setMostrarSugCodigo(false);
  };

  const handleClienteChange = (text) => {
    // Solo permitir texto que forme parte de alguna opción válida
    const textoPermitido = opcionesCliente.some(opcion => 
      opcion.toLowerCase().startsWith(text.toLowerCase())
    );
    
    // Solo actualizar si el texto está vacío o es parte de una opción válida
    if (text === '' || textoPermitido) {
      setCliente(text);
    } else {
      // Si no es válido, no cambiar el valor actual
      return;
    }
    
    // Solo mostrar sugerencias si hay texto
    if (!text.length) {
      setSugerenciasCliente([]);
      setMostrarSugCliente(false);
      return;
    }

    const sugerencias = opcionesCliente.filter((item) =>
      item.toLowerCase().includes(text.toLowerCase())
    );
    setSugerenciasCliente(sugerencias);
    setMostrarSugCliente(sugerencias.length > 0);
    
    // Cerrar otras sugerencias
    setMostrarSugCodigo(false);
    setMostrarSugMaquina(false);
    setMostrarSugTipoConsumo(false);
  };

  const seleccionarCliente = (valor) => {
    Keyboard.dismiss();
    setCliente(valor);
    setMostrarSugCliente(false);
  };

  const handleMaquinaChange = (text) => {
    // Solo permitir texto que forme parte de alguna opción válida
    const textoPermitido = opcionesMaquina.some(opcion => 
      opcion.toLowerCase().startsWith(text.toLowerCase())
    );
    
    // Solo actualizar si el texto está vacío o es parte de una opción válida
    if (text === '' || textoPermitido) {
      setMaquina(text);
    } else {
      // Si no es válido, no cambiar el valor actual
      return;
    }
    
    // Solo mostrar sugerencias si hay texto
    if (!text.length) {
      setSugerenciasMaquina([]);
      setMostrarSugMaquina(false);
      return;
    }

    const sugerencias = opcionesMaquina.filter((item) =>
      item.toLowerCase().includes(text.toLowerCase())
    );
    setSugerenciasMaquina(sugerencias);
    setMostrarSugMaquina(sugerencias.length > 0);
    
    // Cerrar otras sugerencias
    setMostrarSugCodigo(false);
    setMostrarSugCliente(false);
    setMostrarSugTipoConsumo(false);
  };

  const seleccionarMaquina = (valor) => {
    Keyboard.dismiss();
    setMaquina(valor);
    setMostrarSugMaquina(false);
  };

  // MEJORADO: Manejo de tipo de consumo
  const handleTipoConsumoChange = (text) => {
    // Solo permitir texto que forme parte de alguna opción válida
    const textoPermitido = opcionesTipoConsumo.some(opcion => 
      opcion.toLowerCase().startsWith(text.toLowerCase())
    );
    
    // Solo actualizar si el texto está vacío o es parte de una opción válida
    if (text === '' || textoPermitido) {
      setTipoConsumo(text);
    } else {
      // Si no es válido, no cambiar el valor actual
      return;
    }
    
    // MEJORAR: Siempre mostrar todas las opciones si hay texto o al hacer foco
    if (text.length === 0) {
      // Mostrar todas las opciones cuando no hay texto
      setSugerenciasTipoConsumo(opcionesTipoConsumo);
      setMostrarSugTipoConsumo(true);
    } else {
      // Filtrar por texto ingresado
      const sugerencias = opcionesTipoConsumo.filter((item) =>
        item.toLowerCase().includes(text.toLowerCase())
      );
      setSugerenciasTipoConsumo(sugerencias);
      setMostrarSugTipoConsumo(sugerencias.length > 0);
    }
    
    // Cerrar otras sugerencias
    setMostrarSugCodigo(false);
    setMostrarSugMaquina(false);
    setMostrarSugCliente(false);
  };

  // NUEVA función para manejar el foco en tipo de consumo
  const handleTipoConsumoFocus = () => {
    // Mostrar todas las opciones al hacer foco
    setSugerenciasTipoConsumo(opcionesTipoConsumo);
    setMostrarSugTipoConsumo(true);
    
    // Cerrar otras sugerencias
    setMostrarSugCodigo(false);
    setMostrarSugMaquina(false);
    setMostrarSugCliente(false);
  };

  const seleccionarTipoConsumo = (valor) => {
    Keyboard.dismiss();
    setTipoConsumo(valor);
    setMostrarSugTipoConsumo(false);
  };

  const cerrarTodasLasSugerencias = () => {
    setMostrarSugCodigo(false);
    setMostrarSugMaquina(false);
    setMostrarSugCliente(false);
    setMostrarSugTipoConsumo(false);
  };

  const handleGuardar = async () => {
    // Ocultar teclado inmediatamente
    Keyboard.dismiss();

    if (!usuario || !token) {
      showToast('Debes estar autenticado para registrar usos', 'error');
      return;
    }

    // PRIMERO: Validar que todos los campos estén completos
    if (!codigo || !cliente || !maquina || !lugarUso || !cantidad || !tipoConsumo) {
      showToast('Todos los campos son obligatorios', 'error');
      return;
    }

    // SEGUNDO: Validación específica para cantidad (solo si ya ingresó algo)
    const cantidadNumerica = Number(cantidad);
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
      showToast('La cantidad debe ser mayor a cero', 'error');
      return;
    }

    // Validar que cliente, máquina y tipo de consumo sean opciones válidas
    const clienteValido = opcionesCliente.some(opcion => 
      opcion.toLowerCase() === cliente.toLowerCase()
    );
    const maquinaValida = opcionesMaquina.some(opcion => 
      opcion.toLowerCase() === maquina.toLowerCase()
    );
    const tipoConsumoValido = opcionesTipoConsumo.some(opcion => 
      opcion.toLowerCase() === tipoConsumo.toLowerCase()
    );

    if (!clienteValido) {
      showToast('Cliente inválido. Selecciona de la lista', 'error');
      return;
    }

    if (!maquinaValida) {
      showToast('Tipo de máquina inválido. Selecciona Moneda o Billete', 'error');
      return;
    }

    if (!tipoConsumoValido) {
      showToast('Tipo de consumo inválido. Selecciona Consumo o Facturable', 'error');
      return;
    }

    // Validar que el repuesto existe en el stock personal
    const repuestoEnStock = stockDisponible.find(item => item.codigo === codigo);
    if (!repuestoEnStock) {
      showToast('Este repuesto no está en tu stock personal', 'error');
      return;
    }

    if (cantidadNumerica > repuestoEnStock.cantidad) {
      showToast(`Stock insuficiente. Disponible: ${repuestoEnStock.cantidad}`, 'error');
      return;
    }

    const dataToSend = {
      codigo,
      nombre: nombreRepuesto || repuestoEnStock.nombre,
      maquina,
      lugarUso,
      cliente,
      cantidad: cantidadNumerica,
      tipoConsumo 
    };

    try {
      console.log('Registrando uso en:', getApiUrl(`/api/usos`));
      console.log('Datos a enviar:', dataToSend);

      const respuesta = await fetch(getApiUrl('/api/usos'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('Respuesta status:', respuesta.status);

      if (!respuesta.ok) {
        const errorText = await respuesta.text();
        console.error('Error en respuesta:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          // Mostrar el mensaje de error específico del backend
          const mensajeError = errorJson.error || errorJson.message || 'Error desconocido';
          showToast(mensajeError, 'error');
        } catch {
          showToast(`Error del servidor (${respuesta.status})`, 'error');
        }
        return;
      }

      const data = await respuesta.json();
      console.log('Uso registrado exitosamente:', data);
      
      showToast('Uso registrado con éxito');
      
      // Limpiar formulario
      setCodigo('');
      setCliente('');
      setMaquina('');
      setLugarUso('');
      setCantidad('');
      setNombreRepuesto('');
      setTipoConsumo(''); 
      
      // Recargar stock personal después de registrar uso
      try {
        const res = await fetch(getApiUrl(`/api/stock/usuario/${usuario.nombre}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const stockData = await res.json();
          const disponibles = stockData.filter(item => item.cantidad > 0);
          setStockDisponible(disponibles);
        }
      } catch (error) {
        console.log('Error al recargar stock:', error);
      }
      
    } catch (error) {
      console.error('Error de conexión:', error);
      showToast('Error de conexión. Intente nuevamente', 'error');
    }
  };

  // Mostrar mensaje si no está autenticado
  if (!usuario || !token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CustomHeader />
        <View style={styles.container}>
          <Text style={styles.errorText}>Por favor inicia sesión para registrar usos</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Registrar Uso de Repuesto</Text>

        {/* Indicador de stock disponible */}
        <Text style={styles.stockIndicator}>
          Tu stock disponible: {stockDisponible.length} repuestos
        </Text>

        {/* 1. CÓDIGO DEL REPUESTO */}
        <View style={[styles.inputContainer, { zIndex: 1000 }]}>
          <TextInput
            placeholder="Código del repuesto"
            style={styles.input}
            value={codigo}
            onChangeText={handleCodigoChange}
          />
          {mostrarSugCodigo && sugerenciasCodigo.length > 0 && (
            <View style={styles.sugerencias}>
              {sugerenciasCodigo.map((item) => (
                <TouchableOpacity 
                  key={item.codigo} 
                  style={styles.sugerenciaContainer}
                  onPress={() => seleccionarCodigo(item.codigo, item.nombre)}
                >
                  <Text style={styles.sugerenciaItem}>
                    {item.codigo} - {item.nombre} ({item.cantidad} disponibles)
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.nombre}>Nombre: {nombreRepuesto || '-'}</Text>

        {/* 2. CLIENTE */}
        <View style={[styles.inputContainer, { zIndex: 900 }]}>
          <TextInput
            placeholder="Cliente"
            style={styles.input}
            value={cliente}
            onChangeText={handleClienteChange}
            onFocus={cerrarTodasLasSugerencias}
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
          />
          {mostrarSugCliente && sugerenciasCliente.length > 0 && (
            <View style={styles.sugerencias}>
              {sugerenciasCliente.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.sugerenciaContainer}
                  onPress={() => seleccionarCliente(item)}
                >
                  <Text style={styles.sugerenciaItem}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 3. TIPO DE MÁQUINA */}
        <View style={[styles.inputContainer, { zIndex: 800 }]}>
          <TextInput
            placeholder="Tipo de máquina"
            style={styles.input}
            value={maquina}
            onChangeText={handleMaquinaChange}
            onFocus={cerrarTodasLasSugerencias}
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
          />
          {mostrarSugMaquina && sugerenciasMaquina.length > 0 && (
            <View style={styles.sugerencias}>
              {sugerenciasMaquina.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.sugerenciaContainer}
                  onPress={() => seleccionarMaquina(item)}
                >
                  <Text style={styles.sugerenciaItem}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 4. LUGAR DE USO */}
        <TextInput
          style={styles.input}
          placeholder="Lugar de uso"
          value={lugarUso}
          onChangeText={setLugarUso}
          onFocus={cerrarTodasLasSugerencias}
        />

        {/* 5. TIPO DE CONSUMO - MEJORADO */}
        <View style={[styles.inputContainer, { zIndex: 700 }]}>
          <TextInput
            placeholder="Tipo de consumo"
            style={styles.input}
            value={tipoConsumo}
            onChangeText={handleTipoConsumoChange}
            onFocus={handleTipoConsumoFocus}
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
          />
          {mostrarSugTipoConsumo && sugerenciasTipoConsumo.length > 0 && (
            <View style={styles.sugerencias}>
              {sugerenciasTipoConsumo.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.sugerenciaContainer}
                  onPress={() => seleccionarTipoConsumo(item)}
                >
                  <Text style={styles.sugerenciaItem}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 6. CANTIDAD */}
        <TextInput
          style={styles.input}
          placeholder="Cantidad"
          value={cantidad}
          onChangeText={setCantidad}
          keyboardType="numeric"
          onFocus={cerrarTodasLasSugerencias}
        />

        <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
          <Text style={styles.textoBoton}>GUARDAR</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Componente Toast */}
      <Toast 
        message={toast.message}
        visible={toast.visible}
        onHide={hideToast}
        type={toast.type}
      />
    </SafeAreaView>
  );
};

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
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  stockIndicator: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  nombre: {
    marginBottom: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    position: 'relative',
  },
  sugerencias: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    maxHeight: 180,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sugerenciaContainer: {
    backgroundColor: '#fff',
  },
  sugerenciaItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  botonGuardar: {
    backgroundColor: '#60A5FA',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
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
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default AgregarUsoScreen;