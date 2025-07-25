import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../service/firebase";
import Chat from "./chat";

export default function Home() {
  return (
    <View style={styles.container}>
      <Button title="Sair" onPress={() => signOut(auth)} />
      <Chat />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 16 },
});
