import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native'
import { getDatabase, ref, onValue, push } from 'firebase/database'
import { auth } from '../service/firebase'

export const ChatMobile = ({ chamadoId }) => {
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [statusChamado, setStatusChamado] = useState(null)
  const flatListRef = useRef(null)

  useEffect(() => {
    const db = getDatabase()

    // Escuta mensagens
    const mensagensRef = ref(db, `chamados/${chamadoId}/mensagens`)
    const unsubscribeMsgs = onValue(mensagensRef, snapshot => {
      const data = snapshot.val()
      if (data) {
        const lista = Object.entries(data).map(([id, msg]) => ({
          id,
          ...msg,
        }))
        setMensagens(lista.sort((a, b) => a.timestamp - b.timestamp))
      } else {
        setMensagens([])
      }
    })

    // Escuta status do chamado
    const statusRef = ref(db, `chamados/${chamadoId}/status`)
    const unsubscribeStatus = onValue(statusRef, snapshot => {
      setStatusChamado(snapshot.val())
    })

    return () => {
      unsubscribeMsgs()
      unsubscribeStatus()
    }
  }, [chamadoId])

  const enviarMensagem = async () => {
    if (statusChamado === 'fechado') {
      Alert.alert('Chamado fechado', 'Este chamado está encerrado. Não é possível enviar mensagens.')
      return
    }
    if (!novaMensagem.trim()) return
    if (!auth.currentUser) {
      Alert.alert('Erro', 'Usuário não autenticado.')
      return
    }

    const db = getDatabase()
    const mensagensRef = ref(db, `chamados/${chamadoId}/mensagens`)
    await push(mensagensRef, {
      texto: novaMensagem.trim(),
      autor: auth.currentUser.uid,
      timestamp: Date.now(),
    })

    setNovaMensagem('')
    flatListRef.current?.scrollToEnd({ animated: true })
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={mensagens}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.mensagem,
              item.autor === auth.currentUser.uid ? styles.mensagemDireita : styles.mensagemEsquerda,
            ]}
          >
            <Text style={styles.textoMensagem}>{item.texto}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, statusChamado === 'fechado' && styles.inputBloqueado]}
          value={novaMensagem}
          onChangeText={setNovaMensagem}
          editable={statusChamado !== 'fechado'}
          placeholder={
            statusChamado === 'fechado'
              ? 'Chamado encerrado. Chat bloqueado.'
              : 'Digite sua mensagem...'
          }
        />
        <TouchableOpacity
          style={[styles.botaoEnviar, statusChamado === 'fechado' && styles.botaoBloqueado]}
          onPress={enviarMensagem}
          disabled={statusChamado === 'fechado'}
        >
          <Text style={styles.textoBotao}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  mensagem: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '80%',
  },
  mensagemDireita: {
    backgroundColor: '#2196F3',
    alignSelf: 'flex-end',
  },
  mensagemEsquerda: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
  },
  textoMensagem: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputBloqueado: {
    backgroundColor: '#eee',
  },
  botaoEnviar: {
    marginLeft: 8,
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  botaoBloqueado: {
    backgroundColor: '#999',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
})
