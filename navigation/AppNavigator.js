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
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

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
    <NavigationContainer>
      <Stack.Navigator>
        {usuario ? (
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