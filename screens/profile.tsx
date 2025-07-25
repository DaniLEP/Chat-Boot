import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { auth, realtimeDb } from "../service/firebase";
import { ref, get, set } from "firebase/database";
import * as ImagePicker from "expo-image-picker";

export default function Profile() {
  const [name, setName] = useState("");
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const userRef = ref(realtimeDb, `users/${userId}`);

    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setName(data.name || "");
        setPhotoBase64(data.photoBase64 || null);
      }
    });
  }, [userId]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Precisamos da permissão para acessar a galeria.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.5,
    });

    if (!result.cancelled) {
      setPhotoBase64(result.base64 || null);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    const userRef = ref(realtimeDb, `users/${userId}`);
    await set(userRef, { name, photoBase64 });
    Alert.alert("Perfil salvo com sucesso!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome:</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Seu nome"
        style={styles.input}
      />

      <Button title="Selecionar Foto" onPress={pickImage} />

      {photoBase64 && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${photoBase64}` }}
          style={styles.photo}
        />
      )}

      <Button title="Salvar" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 16, marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 10,
    borderRadius: 6,
  },
  photo: {
    width: 120,
    height: 120,
    marginVertical: 16,
    borderRadius: 60,
    alignSelf: "center",
  },
});
