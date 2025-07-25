import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ListaChamadosMobile } from './screens/listaChamados'
import { ChatMobile } from './screens/chat'
import { NovoChamadoMobile } from './screens/novoChat'
import { LogBox } from 'react-native'

LogBox.ignoreLogs(['Setting a timer']) // ignora warning chato do Firebase

export type RootStackParamList = {
  ListaChamadosMobile: undefined
  ChatMobile: { chamadoId: string; titulo: string }
  NovoChamadoMobile: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ListaChamadosMobile">
        <Stack.Screen
          name="ListaChamadosMobile"
          component={ListaChamadosMobile}
          options={{ title: 'Chamados' }}
        />
        <Stack.Screen
          name="ChatMobile"
          component={ChatMobile}
          options={({ route }) => ({ title: route.params.titulo })}
        />
        <Stack.Screen
          name="NovoChamadoMobile"
          component={NovoChamadoMobile}
          options={{ title: 'Novo Chamado' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
