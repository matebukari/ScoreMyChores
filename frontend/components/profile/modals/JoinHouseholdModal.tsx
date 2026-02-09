import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";

interface JoinHouseholdModalProps {
  visible: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
  loading: boolean;
}

export default function JoinHouseholdModal({ visible, onClose, onJoin, loading }: JoinHouseholdModalProps) {
  const [code, setCode] = useState("");

  const handleJoin = () => {
    if (code.trim()) {
      onJoin(code);
      setCode(""); 
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Join Household</Text>
          <Text style={styles.modalSubtitle}>Enter the invite code from the Admin</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Invite Code (e.g. A1B2C3)"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleJoin} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Join</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", width: "90%", padding: 25, borderRadius: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  modalSubtitle: { fontSize: 14, color: "#666", marginBottom: 20, textAlign: "center" },
  input: { backgroundColor: "#f0f0f0", padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  button: { flex: 1, padding: 15, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "#ccc" },
  saveButton: { backgroundColor: "#63B995" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});