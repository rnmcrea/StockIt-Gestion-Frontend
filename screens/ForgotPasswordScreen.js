// frontend/screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import config from '../config/config';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

  const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEnviarRecuperacion = async () => {
    if (!email.trim()) {
      Alert.alert('⚠️ Error', 'Ingresa tu correo electrónico');
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert('⚠️ Error', 'Ingresa un correo electrónico válido');
      return;
    }

    try {
      setCargando(true);
      const res = await fetch(`${config.API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email.trim().toLowerCase() })
      });

      const data = await res.json();

      if (res.ok) {
        setEmailEnviado(true);
        
        // En desarrollo, mostrar el token si está disponible
        if (data.resetToken && __DEV__) {
          Alert.alert(
            '🔑 Token de Desarrollo',
            `Token para testing: ${data.resetToken}\n\n(Esto solo se muestra en desarrollo)`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Error', data.error || 'No se pudo procesar la solicitud');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setCargando(false);
    }
  };

  const handleReenviar = () => {
    setEmailEnviado(false);
    handleEnviarRecuperacion();
  };

  const handleVolver = () => {
    navigation.goBack();
  };

  if (emailEnviado) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* Ícono de éxito */}
          <View style={styles.iconoContainer}>
            <View style={styles.iconoExito}>
              <Text style={styles.textoIconoExito}>✉️</Text>
            </View>
          </View>

          {/* Mensaje de éxito */}
          <View style={styles.mensajeContainer}>
            <Text style={styles.tituloExito}>¡Email Enviado! 📧</Text>
            <Text style={styles.mensajeExito}>
              Hemos enviado las instrucciones de recuperación a:
            </Text>
            <Text style={styles.emailEnviado}>{email}</Text>
            <Text style={styles.instrucciones}>
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </Text>
          </View>

          {/* Botones */}
          <View style={styles.botonesContainer}>
            <TouchableOpacity 
              style={styles.botonPrimario}
              onPress={handleVolver}
            >
              <Text style={styles.textoBotonPrimario}>Volver al Login</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.botonSecundario}
              onPress={handleReenviar}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#2196F3" size="small" />
              ) : (
                <Text style={styles.textoBotonSecundario}>Reenviar Email</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Ayuda adicional */}
          <View style={styles.ayudaContainer}>
            <Text style={styles.textoAyuda}>¿No recibiste el email?</Text>
            <Text style={styles.textoAyuda}>• Revisa tu carpeta de spam</Text>
            <Text style={styles.textoAyuda}>• Verifica que el email esté bien escrito</Text>
            <Text style={styles.textoAyuda}>• Intenta reenviar el mensaje</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Logo de la empresa */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/120x120/2196F3/ffffff?text=LOGO' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Título */}
        <View style={styles.tituloContainer}>
          <Text style={styles.titulo}>¿Olvidaste tu contraseña? 🔐</Text>
          <Text style={styles.subtitulo}>
            No te preocupes, te enviaremos instrucciones para restablecerla
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu correo electrónico"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!cargando}
          />

          <Text style={styles.descripcion}>
            Te enviaremos un enlace para restablecer tu contraseña a este correo
          </Text>

          {/* Botón de enviar */}
          <TouchableOpacity 
            style={[styles.botonEnviar, cargando && styles.botonDeshabilitado]}
            onPress={handleEnviarRecuperacion}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.textoBotonEnviar}>Enviar Instrucciones</Text>
            )}
          </TouchableOpacity>

          {/* Botón volver */}
          <TouchableOpacity 
            style={styles.botonVolver}
            onPress={handleVolver}
            disabled={cargando}
          >
            <Text style={styles.textoBotonVolver}>← Volver al Login</Text>
          </TouchableOpacity>
        </View>

        {/* Información de seguridad */}
        <View style={styles.seguridadContainer}>
          <Text style={styles.tituloSeguridad}>🔒 Tu seguridad es importante</Text>
          <Text style={styles.textoSeguridad}>
            • Solo tú puedes usar este enlace de recuperación{'\n'}
            • El enlace expira en 1 hora por seguridad{'\n'}
            • Si no solicitaste esto, puedes ignorar este mensaje
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 80,
    height: 80,
  },
  tituloContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  etiqueta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  descripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 25,
    lineHeight: 20,
  },
  botonEnviar: {
    backgroundColor: '#e67e22',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  botonDeshabilitado: {
    backgroundColor: '#bdc3c7',
  },
  textoBotonEnviar: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botonVolver: {
    alignItems: 'center',
    padding: 10,
  },
  textoBotonVolver: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
  seguridadContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  tituloSeguridad: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  textoSeguridad: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  
  // Estilos para pantalla de éxito
  iconoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconoExito: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  textoIconoExito: {
    fontSize: 50,
  },
  mensajeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tituloExito: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 15,
  },
  mensajeExito: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  emailEnviado: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  instrucciones: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  botonesContainer: {
    marginBottom: 30,
  },
  botonPrimario: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  textoBotonPrimario: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botonSecundario: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  textoBotonSecundario: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
  ayudaContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  textoAyuda: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
    lineHeight: 18,
  }

});

export default ForgotPasswordScreen;