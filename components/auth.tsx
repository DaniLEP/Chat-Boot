import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { auth, realtimeDb } from "../service/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { ref, get, update } from "firebase/database";

const UserType = { ADMIN: "Admin", COZINHA: "Cozinha", TI: "T.I" };

interface Props {
  onLoginSuccess: () => void;
}

export default function Auth({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Erro", "E-mail inválido.");
      return;
    }
    if (!password) {
      Alert.alert("Erro", "Digite a senha.");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userRef = ref(realtimeDb, "usuarios/" + user.uid);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const funcao = userData.funcao;

        await update(userRef, { ultimoAcesso: new Date().toISOString() });

        if (!funcao || !Object.values(UserType).includes(funcao)) {
          Alert.alert("Erro", "Função de usuário inválida.");
          await auth.signOut();
          return;
        }

        onLoginSuccess();
      } else {
        Alert.alert("Erro", "Usuário não encontrado no sistema.");
        await auth.signOut();
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/user-not-found") Alert.alert("Erro", "Usuário não encontrado.");
      else if (error.code === "auth/wrong-password") Alert.alert("Erro", "Senha incorreta.");
      else Alert.alert("Erro", "Erro ao fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!validateEmail(resetEmail)) {
      Alert.alert("Erro", "Digite um e-mail válido!");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert("Sucesso", "Instruções enviadas para seu e-mail.");
      setShowReset(false);
    } catch (error) {
      Alert.alert("Erro", "Erro ao enviar e-mail de redefinição.");
    }
  };

  return (
    <View style={styles.container}>
      {!showReset ? (
        <>
          <Text style={styles.title}>Acesse sua conta</Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={{ marginLeft: 10 }}
            >
              <Text>{isPasswordVisible ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowReset(true)}>
                <Text style={styles.link}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      ) : (
        // Reset Password UI
        <View>
          <Text style={styles.title}>Recuperar senha</Text>
          <TextInput
            placeholder="Digite seu e-mail"
            value={resetEmail}
            onChangeText={setResetEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handlePasswordReset}
          >
            <Text style={styles.buttonText}>Enviar instruções</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowReset(false)}>
            <Text style={styles.link}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#7c3aed",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  link: { color: "#7c3aed", textAlign: "center", marginTop: 10 },
});
