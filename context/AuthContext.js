// frontend/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Verificar si hay token guardado al iniciar la app
  useEffect(() => {
    verificarSesionGuardada();
  }, []);

  const verificarSesionGuardada = async () => {
    try {
      const tokenGuardado = await AsyncStorage.getItem('token');
      const usuarioGuardado = await AsyncStorage.getItem('usuario');
      
      if (tokenGuardado && usuarioGuardado) {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      }
    } catch (error) {
      console.error('Error verificando sesiÃ³n guardada:', error);
    } finally {
      setCargando(false);
    }
  };

  const iniciarSesion = async (tokenAuth, datosUsuario) => {
    try {
      setUsuario(datosUsuario);
      setToken(tokenAuth);
      await AsyncStorage.setItem('token', tokenAuth);
      await AsyncStorage.setItem('usuario', JSON.stringify(datosUsuario));
    } catch (error) {
      console.error('Error guardando sesiÃ³n:', error);
      throw error;
    }
  };

  const cerrarSesion = async () => {
    try {
      setUsuario(null);
      setToken(null);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
    } catch (error) {
      console.error('Error cerrando sesiÃ³n:', error);
    }
  };

  // Mantener compatibilidad con nombres anteriores
  const login = iniciarSesion;
  const logout = cerrarSesion;

  const value = {
    usuario,
    token,
    cargando,
    iniciarSesion,
    cerrarSesion,
    login,  // Para compatibilidad
    logout, // Para compatibilidad
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};