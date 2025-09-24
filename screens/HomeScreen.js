import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  const { cerrarSesion, usuario } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    setModalVisible(true);
  };

  const confirmarCierreSesion = () => {
    setModalVisible(false);
    cerrarSesion();
  };

  const cancelarCierreSesion = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Encabezado personalizado */}
      <CustomHeader />
      
      <View style={styles.container}>
        <Text style={styles.titulo}>¿Qué necesitas hacer?</Text>
        
        <View style={styles.cardsContainer}>
          {/* Fila superior */}
          <View style={styles.fila}>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate('Stock')}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="add-circle" size={40} color="#4CAF50" />
              </View>
              <Text style={styles.cardTitle}>Registrar</Text>
              <Text style={styles.cardSubtitle}>Repuesto</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate('VerStock')}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="cube" size={40} color="#2196F3" />
              </View>
              <Text style={styles.cardTitle}>Ver</Text>
              <Text style={styles.cardSubtitle}>Stock</Text>
            </TouchableOpacity>
          </View>

          {/* Fila inferior */}
          <View style={styles.fila}>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate('AgregarUso')}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="remove-circle" size={40} color="#FF9800" />
              </View>
              <Text style={styles.cardTitle}>Registrar</Text>
              <Text style={styles.cardSubtitle}>Uso</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card}
              onPress={() => navigation.navigate('Historial')}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="time" size={40} color="#9C27B0" />
              </View>
              <Text style={styles.cardTitle}>Ver</Text>
              <Text style={styles.cardSubtitle}>Historial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Botón de cerrar sesión en la parte inferior */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#e76f51" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modal personalizado para confirmar cierre de sesión */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cancelarCierreSesion}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            
            <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro que deseas cerrar sesión?
            </Text>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelarCierreSesion}
              >
                <Text style={styles.cancelButtonText}>NO</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmarCierreSesion}
              >
                <Text style={styles.confirmButtonText}>SI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
    textAlign: 'center',
  },
  cardsContainer: {
    width: '100%',
    maxWidth: 400,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    minHeight: 120,
  },
  iconContainer: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  bottomContainer: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#e76f51',
    fontWeight: '500',
  },
  // Estilos del modal personalizado
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    width: '85%',
    maxWidth: 350,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  modalIconContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 50,
    padding: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#C0C0C0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#f44336',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});