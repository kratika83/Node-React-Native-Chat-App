// screens/RegisterScreen.js
import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { register } from "../services/api";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await register({ name, email, password });
      navigation.replace("Login");
    } catch (err) {
      console.log("Register error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f0f0f0" }}>
      <View style={{ backgroundColor: "#fff", borderRadius: 15, padding: 20, elevation: 3 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
          Register
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 10,
            marginBottom: 10,
          }}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
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
        <Button title="Register" onPress={handleRegister} />
        <Button title="Back to Login" onPress={() => navigation.navigate("Login")} />
      </View>
    </View>
  );
}