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
  ScrollView,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { householdService } from "@/services/householdService";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HouseholdSetup() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [houseName, setHouseName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const insets = useSafeAreaInsets();

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
      style={[
        styles.container,
        { 
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: 40, 
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 40,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="home" size={48} color="#63B995" />
          </View>
          <Text style={styles.title}>Welcome Home</Text>
          <Text style={styles.subtitle}>Create a new household or join an existing one to get started.</Text>
        </View>

        {/* Option A: Create */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="add" size={24} color="#63B995" />
            </View>
            <Text style={styles.cardTitle}>Create New Household</Text>
          </View>
          
          <Text style={styles.cardDescription}>Start fresh and invite your family or roommates.</Text>
          
          <TextInput
            placeholder="Household Name (e.g. The Smiths)"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={houseName}
            onChangeText={setHouseName}
          />
          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Household</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.line}/>
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line}/>
        </View>

        {/* Option B: Join */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="enter-outline" size={24} color="#42A5F5" />
            </View>
            <Text style={styles.cardTitle}>Join with Code</Text>
          </View>

          <Text style={styles.cardDescription}>Enter the invite code shared by your admin.</Text>

          <TextInput
            placeholder="6-Digit Invite Code"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            autoCapitalize="characters"
            value={inviteCode}
            onChangeText={setInviteCode}
            maxLength={6}
          />
          <TouchableOpacity
            style={[styles.button, styles.joinButton]}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#63B995" />
            ) : (
              <Text style={[styles.buttonText, styles.joinButtonText]}>Join Household</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: { alignItems: "center", marginBottom: 40 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#63B995",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 32, fontWeight: "bold", color: "#333", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 10, textAlign: "center", paddingHorizontal: 20, lineHeight: 22 },
  
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center", marginRight: 12
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  cardDescription: { fontSize: 14, color: "#888", marginBottom: 20 },
  
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },
  
  button: { padding: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  createButton: { backgroundColor: "#63B995", shadowColor: "#63B995", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  joinButton: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#63B995" },
  
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  joinButtonText: { color: "#63B995" },
  
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  orText: { marginHorizontal: 16, color: "#9CA3AF", fontWeight: "bold", fontSize: 12, letterSpacing: 1 },
});