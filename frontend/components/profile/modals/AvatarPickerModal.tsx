import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Avatars } from "@/constants/avatars";

const AVATAR_CATEGORIES = [
  {
    title: "Human",
    data: [
      "human1",
      "human2",
      "human3",
      "human4",
      "human5",
      "human6",
      "human7",
      "human8",
      "human9",
      "human10",
      "human11",
      "human12",
      "human13",
      "human14",
      "human15",
      "human16",
      "human17",
      "human18",
      "human19",
      "human20",
      "human21",
    ],
  },
  {
    title: "Premium",
    data: [
      "premium1",
      "premium2",
      "premium3",
      "premium4",
      "premium5",
      "premium6",
      "premium7",
      "premium8",
      "premium9",
      "premium10",
      "premium11",
      "premium12",
      "premium13",
      "premium14",
      "premium15",
      "premium16",
      "premium17",
      "premium18",
      "premium19",
    ],
  },
];

const ALL_AVATARS = AVATAR_CATEGORIES.flatMap((category) => category.data);

interface AvatarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (newAvatar: string) => void;
  currentAvatar?: string;
}

export default function AvatarPickerModal({
  visible,
  onClose,
  onSelect,
  currentAvatar,
}: AvatarPickerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Pick an Avatar</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Single Grid Container for all avatars */}
            <View style={styles.grid}>
              {ALL_AVATARS.map((avatarKey) => {
                const SvgComponent = Avatars[avatarKey];

                return (
                  <TouchableOpacity
                    key={avatarKey}
                    style={[
                      styles.avatarOption,
                      currentAvatar === avatarKey && styles.selectedOption,
                    ]}
                    onPress={() => {
                      onSelect(avatarKey);
                      onClose();
                    }}
                  >
                    {SvgComponent ? (
                      <View style={styles.svgWrapper}>
                        <SvgComponent width="100%" height="100%" />
                      </View>
                    ) : (
                      <Text style={{ fontSize: 12 }}>{avatarKey}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    height: "70%", // Fixed height for the modal
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  avatarOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    margin: 6,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  selectedOption: {
    borderColor: "#63B995",
    backgroundColor: "#e8f5e9",
  },
  svgWrapper: {
    width: 60,
    height: 60,
  },
  modalButtons: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: "#eee",
  },
  buttonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
});
