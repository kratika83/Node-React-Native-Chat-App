import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSocket, connectSocket } from "../services/socket";
import { getMessages } from "../services/api";

export default function ChatScreen({ route }) {
  const { user, conversation } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState({});
  const meIdRef = useRef(null);
  const convId = conversation?._id;

  useEffect(() => {
    const setup = async () => {
      const token = await AsyncStorage.getItem("token");
      const meId = await AsyncStorage.getItem('userId');
      meIdRef.current = meId;
      const sock = connectSocket(token);
      socketRef.current = sock;

      sock.on('connect', () => {
        if (convId) sock.emit('join:conversation', convId);
      });

      sock.on("message:new", (msg) => {
        if (msg.conversation.toString() !== convId) return;
        setMessages((prev) => [...prev, msg]);
      });

      sock.on('typing:start', ({ userId }) => {
        setTypingUsers(t => ({ ...t, [userId]: true }));
      });
      sock.on('typing:stop', ({ userId }) => {
        setTypingUsers(t => {
          const copy = { ...t }; delete copy[userId]; return copy;
        });
      });

      const { data } = await getMessages(convId, token);
      setMessages(data);
    };
    setup();

    return () => {
      const s = socketRef.current;
      if (s) {
        s.off('message:new');
        s.off('typing:start');
        s.off('typing:stop');
        s.disconnect();
      }
    };
  }, [convId]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const s = socketRef.current;
    const payload = { conversationId: convId, to: user._id, text };
    const optimistic = {
      _id: `temp-${Date.now()}`,
      conversation: convId,
      sender: meIdRef.current,
      recipient: user._id,
      text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimistic]);
    s.emit('message:send', payload);
    setText("");
    s.emit('typing:stop', { conversationId: convId });
  };

  const onChangeText = (t) => {
    setText(t);
    const s = socketRef.current;
    if (!s) return;
    s.emit('typing:start', { conversationId: convId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      s.emit('typing:stop', { conversationId: convId });
    }, 800);
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender === meIdRef.current;
    return (
      <View
        style={[
          styles.bubble,
          isMe ? styles.myBubble : styles.otherBubble
        ]}
      >
        <Text style={isMe ? styles.myText : styles.otherText}>{item.text}</Text>
      </View>
    );
  };

  const otherTyping = Object.keys(typingUsers).length > 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
      {otherTyping ? <Text style={styles.typing}>{user.name} is typing...</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder="Type..."
          style={styles.input}
        />
        <Button title="Send" onPress={sendMessage} color="#4CAF50" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 10, backgroundColor: "#f0f0f0" },
  bubble: {
    padding: 10,
    marginVertical: 5,
    maxWidth: "70%",
    borderRadius: 15,
  },
  myBubble: {
    backgroundColor: "#4CAF50",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: "#E0E0E0",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  myText: { color: "#fff" },
  otherText: { color: "#000" },
  typing: { fontStyle: "italic", marginVertical: 5, textAlign: "left" },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: "#fff",
  },
});