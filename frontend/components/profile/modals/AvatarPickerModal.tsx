import React from "react";
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";

const AVATAR_OPTIONS = [
  "🐶", "🐱", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", 
  "🐮", "🐷", "🐸", "🐙", "🦄", "🐲", "👽", "🤖",
  "💩", "👻", "🦸", "🥷", "🧙", "🧚", "🧜", "🧛"
];

interface AvatarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (newAvatar: string) => void;
}

export default function AvatarPickerModal({ visible, onClose, onSelect }: AvatarPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '60%' }]}>
          <Text style={styles.modalTitle}>Pick an Avatar</Text>
          <FlatList
            data={AVATAR_OPTIONS}
            numColumns={4}
            keyExtractor={(item) => item}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 15 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.avatarOption} onPress={() => onSelect(item)}>
                <Text style={{ fontSize: 32 }}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.button, styles.cancelButton, { marginTop: 10 }]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
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
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  button: { flex: 1, padding: 15, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "#ccc" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  avatarOption: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', margin: 5 },
});