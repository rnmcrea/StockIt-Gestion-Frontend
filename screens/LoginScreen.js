// frontend/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getApiUrl } from '../config/config';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { Ionicons } from '@expo/vector-icons'; // Para el ícono del ojo

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const { iniciarSesion } = useContext(AuthContext);

  // Hook para toast
  const { toast, showToast, hideToast } = useToast();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    try {
      setCargando(true);
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          correo: email.trim().toLowerCase(), 
          password: password.trim() 
        })
      });

      const data = await res.json();

      if (res.ok) {
        await iniciarSesion(data.token, data.usuario);
      } else {
        showToast(data.error || 'Credenciales incorrectas', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('No se pudo conectar al servidor', 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/logo-stockit.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.bienvenida}>Te damos la bienvenida 👋</Text>
          <Text style={styles.subtitulo}>
            Crea tu propio inventario con <Text style={styles.marca}>StockIt</Text>
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          
          {/* Email */}
          <Text style={styles.etiqueta}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="nombre@empresa.cl"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!cargando}
          />

          {/* Contraseña */}
          <Text style={styles.etiqueta}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Ingrese Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCorrect={false}
              editable={!cargando}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={24} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
          </View>

          {/* Botón de login */}
          <TouchableOpacity 
            style={[styles.botonLogin, cargando && styles.botonDeshabilitado]}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.textoBotonLogin}>INICIAR SESIÓN</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast */}
      <Toast 
        message={toast.message}
        visible={toast.visible}
        onHide={hideToast}
        type={toast.type}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    width: 180,
    height: 80,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  bienvenida: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  marca: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  formContainer: {
    marginBottom: 40,
  },
  etiqueta: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    padding: 16,
  },
  botonLogin: {
    backgroundColor: '#60A5FA',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  botonDeshabilitado: {
    backgroundColor: '#9CA3AF',
  },
  textoBotonLogin: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;