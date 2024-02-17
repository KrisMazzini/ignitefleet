import { useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useUser } from '@realm/react'
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
import { useRealm } from '../../libs/realm'
import { History } from '../../libs/realm/schemas/History'

const keyboardAvoidingViewBehavior =
  Platform.OS === 'android' ? 'height' : 'padding'

export function Departure() {
  const [licensePlate, setLicensePlate] = useState('')
  const [description, setDescription] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const user = useUser()
  const realm = useRealm()
  const { goBack } = useNavigation()

  const licensePlateRef = useRef<TextInput>(null)
  const descriptionRef = useRef<TextInput>(null)

  function handleRegisterDeparture() {
    try {
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

      setIsRegistering(true)

      realm.write(() => {
        realm.create(
          'History',
          History.generate({
            description,
            license_plate: licensePlate.toUpperCase(),
            user_id: user.id,
          }),
        )
      })

      Alert.alert('Saída', 'Saída do veículo registrada com sucesso.')
      goBack()
    } catch (error) {
      console.error(error)

      Alert.alert('Erro', 'Não foi possível registrar a saída do veículo.')
      setIsRegistering(false)
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

            <Button
              title="Registrar Saída"
              onPress={handleRegisterDeparture}
              isLoading={isRegistering}
            />
          </Content>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  )
}
