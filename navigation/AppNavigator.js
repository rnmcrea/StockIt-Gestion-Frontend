import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import AgregarUsoScreen from '../screens/AgregarUsoScreen';
import HistorialScreen from '../screens/HistorialScreen';
import LoginScreen from '../screens/LoginScreen';
import StockScreen from '../screens/StockScreen';
import VerStockScreen from '../screens/VerStockScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import AdminUsosScreen from '../screens/AdminUsosScreen';
import AdminResumenScreen from '../screens/AdminResumenScreen';
import AdminStockScreen from '../screens/AdminStockScreen';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

// Config de linking para que en web el boton "atras" del navegador
// navegue el stack en vez de cerrar la app (PWA).
const webOrigin =
  typeof window !== 'undefined' && window.location ? window.location.origin : null;

const linking = {
  prefixes: [webOrigin, 'http://localhost:8081'].filter(Boolean),
  config: {
    screens: {
      Login: 'login',
      Home: '',
      Stock: 'registrar-repuesto',
      VerStock: 'ver-stock',
      AgregarUso: 'registrar-uso',
      Historial: 'historial',
      // Supervisor
      AdminHome: '',
      AdminUsos: 'admin/usos',
      AdminResumen: 'admin/resumen',
      AdminStock: 'admin/stock',
    },
  },
};

export default function AppNavigator() {
  const { usuario, cargando } = useContext(AuthContext);

  // Mostrar pantalla de carga mientras verifica la sesión
  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: '#666' }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        {usuario && usuario.rol === 'admin' ? (
          // Stack para supervisor (solo lectura)
          <>
            <Stack.Screen
              name="AdminHome"
              component={AdminHomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AdminUsos"
              component={AdminUsosScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AdminResumen"
              component={AdminResumenScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AdminStock"
              component={AdminStockScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : usuario ? (
          // Stack para usuarios autenticados
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AgregarUso" 
              component={AgregarUsoScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="VerStock" 
              component={VerStockScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Historial" 
              component={HistorialScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Stock" 
              component={StockScreen} 
              options={{ headerShown: false }} 
            />
          </>
        ) : (
          // Solo login para usuarios NO autenticados
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}