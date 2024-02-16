import { useRef, useState } from 'react'
import {
  Alert,
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

import { validateLicensePlate } from '../../utils/licensePlateValidation'

const keyboardAvoidingViewBehavior =
  Platform.OS === 'android' ? 'height' : 'padding'

export function Departure() {
  const [licensePlate, setLicensePlate] = useState('')
  const [description, setDescription] = useState('')

  const licensePlateRef = useRef<TextInput>(null)
  const descriptionRef = useRef<TextInput>(null)

  function handleRegisterDeparture() {
    const validLicensePlate = validateLicensePlate(licensePlate)

    if (!validLicensePlate) {
      licensePlateRef.current?.focus()

      return Alert.alert(
        'Placa inválida',
        'A placa informada é inválida. Por favor, informe a placa correta do veículo.',
      )
    }

    if (description.trim().length === 0) {
      descriptionRef.current?.focus()

      return Alert.alert(
        'Finalidade',
        'Por favor, informe a finalidade da utilização do veículo.',
      )
    }
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
              ref={licensePlateRef}
              label="Placa do veículo:"
              placeholder="BRA1234"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              returnKeyType="next"
              value={licensePlate}
              onChangeText={setLicensePlate}
            />

            <TextAreaInput
              ref={descriptionRef}
              label="Finalidade"
              placeholder="Vou utilizar o veículo para..."
              blurOnSubmit
              onSubmitEditing={handleRegisterDeparture}
              returnKeyType="send"
              value={description}
              onChangeText={setDescription}
            />

            <Button title="Registrar Saída" onPress={handleRegisterDeparture} />
          </Content>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  )
}
