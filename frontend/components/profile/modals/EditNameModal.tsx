import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";

const MAX_NAME_LENGTH = 16;

interface EditNameModalProps {
  visible: boolean;
  onClose: () => void;
  currentName?: string | null;
  onSave: (newName: string) => void;
  loading: boolean;
}

export default function EditNameModal({ visible, onClose, currentName, onSave, loading }: EditNameModalProps) {
  const [name, setName] = useState(currentName || "");

  useEffect(() => {
   setName(currentName || ""); 
  }, [currentName, visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={MAX_NAME_LENGTH}
          />
          <Text style={styles.charCount}>{name?.length || 0}/{MAX_NAME_LENGTH}</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={() => onSave(name)} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", width: "90%", padding: 25, borderRadius: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  input: { backgroundColor: "#f0f0f0", padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  charCount: { textAlign: 'right', color: '#888', fontSize: 12, marginTop: -10, marginBottom: 20, marginRight: 5 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  button: { flex: 1, padding: 15, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "#ccc" },
  saveButton: { backgroundColor: "#63B995" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});