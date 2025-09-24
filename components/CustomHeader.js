import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';

const CustomHeader = ({ title }) => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      <View style={styles.headerContainer}>
        {/* Lado izquierdo - Logo de la empresa */}
        <View style={styles.logoSection}>
          <Image 
            source={require('../assets/logo-vwk.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Lado derecho - Forma geométrica celeste */}
        <View style={styles.geometricSection}>
          <View style={styles.blueTriangle} />
          <View style={styles.blueRectangle}>
            <Text style={styles.titleText}>Gestión de Repuestos</Text>
            <Text style={styles.subtitleText}>Sistema de Inventario</Text>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  logoSection: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  logo: {
    width: 125,
    height: 60,
  },
  geometricSection: {
    flex: 1.5,
    position: 'relative',
    flexDirection: 'row',
  },
  blueTriangle: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 30,
    borderRightWidth: 0,
    borderBottomWidth: 80,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#00BFFF',
    zIndex: 1,
  },
  blueRectangle: {
    position: 'absolute',
    left: 30,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#00BFFF',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    zIndex: 2,
  },
  titleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 1,
  },
  subtitleText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.95,
    textAlign: 'right',
  },
});

export default CustomHeader;