import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../services/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const { data } = await login({ email, password });
      if (!data.token) {
        setError("No token returned");
        return;
      }
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem('userId', data.user.id || data.user._id);
      navigation.replace("Home");
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f0f0f0" }}>
      <View style={{ backgroundColor: "#fff", borderRadius: 15, padding: 20, elevation: 3 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
          Login
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
          }}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
          }}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}
        <Button title="Login" onPress={handleLogin} color="#4CAF50" />
        <Button title="Register" onPress={() => navigation.navigate("Register")} />
      </View>
    </View>
  );
}