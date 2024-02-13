import { useState } from 'react'
import { Realm, useApp } from '@realm/react'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

import backgroundImg from '../../assets/background.png'
import { Container, Slogan, Title } from './styles'

import { IOS_CLIENT_ID, WEB_CLIENT_ID } from '@env'

import { Button } from '../../components/Button'
import { Alert } from 'react-native'

GoogleSignin.configure({
  scopes: ['email', 'profile'],
  iosClientId: IOS_CLIENT_ID,
  webClientId: WEB_CLIENT_ID,
})

export function SignIn() {
  const app = useApp()
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  async function handleGoogleSignIn() {
    try {
      setIsAuthenticating(true)

      const { idToken } = await GoogleSignin.signIn()

      if (!idToken) {
        Alert.alert('Entrar', 'Não foi possível conectar-se à sua conta Google')
        setIsAuthenticating(false)
        return
      }

      const credentials = Realm.Credentials.jwt(idToken)
      await app.logIn(credentials)
    } catch (error) {
      console.log(error)
      setIsAuthenticating(false)
      Alert.alert('Entrar', 'Não foi possível conectar-se à sua conta Google')
    }
  }

  return (
    <Container source={backgroundImg}>
      <Title>Ignite Fleet</Title>
      <Slogan>Gestão de uso de veículos</Slogan>

      <Button
        title="Entrar com Google"
        onPress={handleGoogleSignIn}
        isLoading={isAuthenticating}
      />
    </Container>
  )
}
