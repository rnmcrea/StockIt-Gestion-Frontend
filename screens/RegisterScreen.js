// frontend/screens/RegisterScreen.js
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

const RegisterScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const validarFormulario = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'El correo electrónico es requerido');
      return false;
    }
    
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido');
      return false;
    }
    
    if (!password) {
      Alert.alert('Error', 'La contraseña es requerida');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validarFormulario()) return;

    try {
      setCargando(true);
      const res = await fetch(`${config.API_URL}/api/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: nombre.trim(), 
          correo: email.trim().toLowerCase(), 
          password 
        })
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert(
          'Registro Exitoso', 
          `¡Bienvenido ${nombre}! Tu cuenta ha sido creada exitosamente.`,
          [
            { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') }
          ]
        );
        
        // Limpiar formulario
        setNombre('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', data.error || 'No se pudo crear la cuenta');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setCargando(false);
    }
  };

  const handleGoogleRegister = () => {
    Alert.alert('Google Register', 'Funcionalidad de Google Register próximamente disponible');
  };

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
          <Text style={styles.titulo}>Crear Cuenta</Text>
          <Text style={styles.subtitulo}>Únete a nosotros y comienza a gestionar tu inventario</Text>
        </View>

        {/* Formulario de registro */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={setNombre}
            editable={!cargando}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!cargando}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña (mínimo 6 caracteres)"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!cargando}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!cargando}
          />

          {/* Botón de registro */}
          <TouchableOpacity 
            style={[styles.botonRegistro, cargando && styles.botonDeshabilitado]}
            onPress={handleRegister}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.textoBotonRegistro}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Divisor */}
          <View style={styles.divisor}>
            <View style={styles.lineaDivisor} />
            <Text style={styles.textoDivisor}>O regístrate con</Text>
            <View style={styles.lineaDivisor} />
          </View>

          {/* Botón de Google */}
          <TouchableOpacity 
            style={styles.botonGoogle}
            onPress={handleGoogleRegister}
            disabled={cargando}
          >
            <View style={styles.iconoGoogle}>
              <Text style={styles.textoIconoGoogle}>G</Text>
            </View>
            <Text style={styles.textoBotonGoogle}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Link de login */}
          <View style={styles.loginContainer}>
            <Text style={styles.textoLogin}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={cargando}>
              <Text style={styles.linkLogin}>Inicia sesión aquí</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
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
  botonRegistro: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  botonDeshabilitado: {
    backgroundColor: '#bdc3c7',
  },
  textoBotonRegistro: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divisor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  lineaDivisor: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e8ed',
  },
  textoDivisor: {
    marginHorizontal: 15,
    color: '#7f8c8d',
    fontSize: 14,
  },
  botonGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  iconoGoogle: {
    width: 24,
    height: 24,
    backgroundColor: '#4285F4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textoIconoGoogle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  textoBotonGoogle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoLogin: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  linkLogin: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;