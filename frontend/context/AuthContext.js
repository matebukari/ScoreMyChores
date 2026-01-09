import { useContext, createContext, useState, useEffect } from "react";
import { Text, View, ActivityIndicator } from "react-native";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate checking for an existing session on app start
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const signin = async (email, password) => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setSession("mock-jwt-token");
      setUser({ email, name: "Test User" });
      setLoading(false);
    }, 1500);
  };

  const register = async (email, password) => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setSession("mock-jwt-token");
      setUser({ email, name: "New User" });
      setLoading(false);
    }, 1500);
  };

  const signout = () => {
    setSession(null);
    setUser(null);
  };

  const contextData = { 
    session, 
    user, 
    isLoading: loading, 
    signin, 
    register, 
    signout 
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color="#63B995" />
          <Text style={{ marginTop: 10 }}>Authenticating...</Text>
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthContext, AuthProvider };