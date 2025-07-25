import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native'
import { getDatabase, ref, onValue, push, set } from 'firebase/database'
import { useNavigation } from '@react-navigation/native'
import { auth } from '../service/firebase' // ajuste seu caminho

export const ListaChamadosMobile = () => {
  const [chamados, setChamados] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [titulo, setTitulo] = useState('')
  const navigation = useNavigation()

  useEffect(() => {
    const db = getDatabase()
    const chamadosRef = ref(db, 'chamados')

    const unsubscribe = onValue(chamadosRef, snapshot => {
      const data = snapshot.val()
      const lista = data
        ? Object.entries(data).map(([id, chamado]: any) => ({ id, ...chamado }))
        : []
      const ordenado = lista.sort((a, b) => b.updatedAt - a.updatedAt)
      setChamados(ordenado)
    })

    return () => unsubscribe()
  }, [])

  const abrirChamado = async () => {
    if (!titulo.trim() || !auth.currentUser) return

    const db = getDatabase()
    const chamadosRef = ref(db, 'chamados')
    const novoRef = push(chamadosRef)

    const novoChamado = {
      titulo: titulo.trim(),
      status: 'aberto',
      criadoPor: auth.currentUser.uid,
      ultimaMensagem: '',
      updatedAt: Date.now(),
      mensagens: {},
    }

    await set(novoRef, novoChamado)

    setTitulo('')
    setModalVisible(false)
    navigation.navigate('ChatMobile', {
      chamadoId: novoRef.key,
      titulo: novoChamado.titulo,
    })
  }

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('ChatMobile', {
          chamadoId: item.id,
          titulo: item.titulo,
        })
      }
    >
      <Text style={styles.titulo}>{item.titulo}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      {item.ultimaMensagem ? (
        <Text style={styles.mensagemPreview}>💬 {item.ultimaMensagem}</Text>
      ) : (
        <Text style={styles.mensagemPreview}>Nenhuma mensagem ainda</Text>
      )}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={chamados}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Modal novo chamado */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Novo Chamado</Text>
            <TextInput
              placeholder="Título do chamado"
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.button, { backgroundColor: '#ccc' }]}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={abrirChamado}
                style={[styles.button, { backgroundColor: '#2196F3' }]}
              >
                <Text style={{ color: '#fff' }}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  status: { color: '#666', marginTop: 4 },
  mensagemPreview: { color: '#444', marginTop: 6, fontStyle: 'italic' },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#2196F3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
})
