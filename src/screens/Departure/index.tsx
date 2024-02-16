import { useRef } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native'

import { Container, Content } from './styles'

import { Header } from '../../components/Header'
import { LicensePlateInput } from '../../components/LicensePlateInput'
import { TextAreaInput } from '../../components/TextAreaInput'
import { Button } from '../../components/Button'

const keyboardAvoidingViewBehavior =
  Platform.OS === 'android' ? 'height' : 'padding'

export function Departure() {
  const descriptionRef = useRef<TextInput>(null)

  function handleRegisterDeparture() {
    console.log('Registrar saída')
  }

  return (
    <Container>
      <Header title="Saída" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={keyboardAvoidingViewBehavior}
      >
        <ScrollView>
          <Content>
            <LicensePlateInput
              label="Placa do veículo:"
              placeholder="BRA1234"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              returnKeyType="next"
            />

            <TextAreaInput
              ref={descriptionRef}
              label="Finalidade"
              placeholder="Vou utilizar o veículo para..."
              blurOnSubmit
              onSubmitEditing={handleRegisterDeparture}
              returnKeyType="send"
            />

            <Button title="Registrar Saída" onPress={handleRegisterDeparture} />
          </Content>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  )
}
