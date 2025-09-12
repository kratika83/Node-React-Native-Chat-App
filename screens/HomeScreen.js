import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createConversation, getUsers } from "../services/api";

export default function HomeScreen({ navigation }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        const { data } = await getUsers(token);
        setUsers(data);
      } catch (err) {
        console.log('Error fetching users:', err.response?.data || err.message);
      }
    };
    fetchUsers();
  }, []);

  const openChat = async (otherUser) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await createConversation(otherUser._id, token);
      const conv = res.data;
      navigation.navigate('Chat', { user: otherUser, conversation: conv });
    } catch (err) {
      console.log('openChat error', err.response?.data || err.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openChat(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f9f9f9" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontWeight: "bold" },
  name: { fontSize: 16, fontWeight: "600" },
});