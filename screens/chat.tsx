import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { getDatabase, ref, onValue, push, set, update } from 'firebase/database'
import { auth } from '../service/firebase' // ajuste seu caminho
import { useRoute } from '@react-navigation/native'

export const ChatMobile = () => {
  const route = useRoute()
  const { chamadoId, titulo } = route.params as { chamadoId: string; titulo: string }
  const [mensagens, setMensagens] = useState<any[]>([])
  const [input, setInput] = useState('')
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    const db = getDatabase()
    const mensagensRef = ref(db, `chamados/${chamadoId}/mensagens`)

    const unsubscribe = onValue(mensagensRef, snapshot => {
      const data = snapshot.val()
      const lista = data
        ? Object.entries(data).map(([id, msg]: any) => ({ id, ...msg }))
        : []
      setMensagens(lista)
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200)
    })

    return () => unsubscribe()
  }, [chamadoId])

  const enviarMensagem = async () => {
    if (!input.trim() || !auth.currentUser) return

    const db = getDatabase()
    const mensagensRef = ref(db, `chamados/${chamadoId}/mensagens`)
    const novaMensagemRef = push(mensagensRef)

    const novaMensagem = {
      texto: input.trim(),
      usuarioId: auth.currentUser.uid,
      usuarioNome: auth.currentUser.displayName || 'Usuário',
      criadoEm: Date.now(),
    }

    await set(novaMensagemRef, novaMensagem)

    const chamadoRef = ref(db, `chamados/${chamadoId}`)
    await update(chamadoRef, {
      ultimaMensagem: novaMensagem.texto,
      updatedAt: Date.now(),
    })

    setInput('')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Text style={styles.titulo}>{titulo}</Text>

      <FlatList
        ref={flatListRef}
        data={mensagens}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.mensagemContainer,
              item.usuarioId === auth.currentUser?.uid
                ? styles.mensagemEnviada
                : styles.mensagemRecebida,
            ]}
          >
            <Text style={styles.usuarioNome}>{item.usuarioNome}</Text>
            <Text style={styles.textoMensagem}>{item.texto}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 12 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={enviarMensagem}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={enviarMensagem} style={styles.botaoEnviar}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  mensagemContainer: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    maxWidth: '75%',
  },
  mensagemEnviada: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  mensagemRecebida: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  usuarioNome: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#555',
  },
  textoMensagem: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  botaoEnviar: {
    marginLeft: 8,
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
})
