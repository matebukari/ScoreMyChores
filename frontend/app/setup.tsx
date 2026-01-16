import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { householdService } from "@/services/householdService";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HouseholdSetup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [houseName, setHouseName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleCreate = async () => {
    if (!houseName.trim()) {
      Alert.alert("Error", "Please enter a household name");
      return;
    }
    setLoading(true);
    try {
      if (user) {
        await householdService.createHousehold(user.uid, houseName);
        router.replace("/"); // Go to home
      }
    } catch (error) {
      Alert.alert("Error", "Could not create household.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }
    setLoading(true);
    try {
      if (user) {
        await householdService.joinHousehold(user.uid, inviteCode.toUpperCase());
        router.replace('/'); // Go to Home
      }
    } catch (error) {
      Alert.alert("Error", "Invalid invite code or network error.");
    } finally {
      setLoading(false);
    }
  };

  return(
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Ionicons name="home" size={60} color="#4A90E2" />
        <Text style={styles.title}>Welcome Home</Text>
        <Text style={styles.subtitle}>Let's get you settled in.</Text>
      </View>

      {/* Option A: Create */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create a New Household</Text>
        <TextInput
          placeholder="e.g. The Smith Family"
          style={styles.input}
          value={houseName}
          onChangeText={setHouseName}
        />
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create House</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.line}/>
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line}/>
      </View>

      {/* Option B: Join */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Join Existing Household</Text>
        <TextInput
          placeholder="Enter 6-digit Invite Code"
          style={styles.input}
          autoCapitalize="characters"
          value={inviteCode}
          onChangeText={setInviteCode}
        />
        <TouchableOpacity
          style={[styles.button, styles.joinButton]}
          onPress={handleJoin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#4A90E2" /> : <Text style={[styles.buttonText, styles.joinButton]}>Join with Code</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
  },
  header: { alignItems: "center", marginBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginTop: 16 },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8 },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  input: {
    backgroundColor: "#F0F2F5",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: { padding: 16, borderRadius: 12, alignItems: "center" },
  createButton: { backgroundColor: "#4A90E2" },
  joinButton: { backgroundColor: "#E3F2FD" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  joinButtonText: { color: "#4A90E2" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  orText: { marginHorizontal: 16, color: "#999", fontWeight: "bold" },
});
