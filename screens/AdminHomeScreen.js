import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminHomeScreen({ navigation }) {
  const { cerrarSesion, usuario } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader />

      <View style={styles.container}>
        <Text style={styles.titulo}>Panel de Supervisor</Text>
        {usuario?.nombre ? (
          <Text style={styles.subtitulo}>{usuario.nombre}</Text>
        ) : null}

        <View style={styles.cardsContainer}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminUsos')}>
            <Ionicons name="people" size={38} color="#2196F3" />
            <Text style={styles.cardTitle}>Usos por técnico</Text>
            <Text style={styles.cardSubtitle}>Qué usó cada técnico por rango de fechas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminResumen')}>
            <Ionicons name="bar-chart" size={38} color="#4CAF50" />
            <Text style={styles.cardTitle}>Resumen mensual</Text>
            <Text style={styles.cardSubtitle}>Repuestos más usados del mes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AdminStock')}>
            <Ionicons name="cube" size={38} color="#FF9800" />
            <Text style={styles.cardTitle}>Stock por técnico</Text>
            <Text style={styles.cardSubtitle}>Repuestos que cada técnico tiene</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="log-out-outline" size={20} color="#e76f51" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            <Text style={styles.modalMessage}>¿Estás seguro que deseas cerrar sesión?</Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>NO</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => { setModalVisible(false); cerrarSesion(); }}
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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20, paddingTop: 30 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  subtitulo: { fontSize: 15, color: '#666', marginTop: 4, marginBottom: 24 },
  cardsContainer: { width: '100%', maxWidth: 460 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 22,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
  cardSubtitle: { fontSize: 13, color: '#777', marginTop: 4, textAlign: 'center' },
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoutText: { marginLeft: 8, fontSize: 16, color: '#e76f51', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 30, margin: 20, width: '85%', maxWidth: 350, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  modalMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30, lineHeight: 24 },
  modalButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', marginHorizontal: 8 },
  cancelButton: { backgroundColor: '#C0C0C0', borderWidth: 1, borderColor: '#e0e0e0' },
  confirmButton: { backgroundColor: '#f44336' },
  cancelButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
