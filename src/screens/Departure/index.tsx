import { useEffect, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useUser } from '@realm/react'
import { Car } from 'phosphor-react-native'
import {
  LocationAccuracy,
  LocationObjectCoords,
  LocationSubscription,
  requestBackgroundPermissionsAsync,
  useForegroundPermissions,
  watchPositionAsync,
} from 'expo-location'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native'

import { Container, Content, Message } from './styles'

import { Header } from '../../components/Header'
import { LicensePlateInput } from '../../components/LicensePlateInput'
import { TextAreaInput } from '../../components/TextAreaInput'
import { Button } from '../../components/Button'
import { Loading } from '../../components/Loading'
import { LocationInfo } from '../../components/LocationInfo'
import { Map } from '../../components/Map'

import { validateLicensePlate } from '../../utils/licensePlateValidation'
import { getAddressLocation } from '../../utils/getAddressLocation'

import { useRealm } from '../../libs/realm'
import { History } from '../../libs/realm/schemas/History'

import { startBackgroundLocationTask } from '../../tasks/backgroundLocationTask'

const keyboardAvoidingViewBehavior =
  Platform.OS === 'android' ? 'height' : 'padding'

export function Departure() {
  const [licensePlate, setLicensePlate] = useState('')
  const [description, setDescription] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [currentAddress, setCurrentAddress] = useState<string>('')
  const [currentCoords, setCurrentCoords] =
    useState<LocationObjectCoords | null>(null)

  const [locationForegroundPermission, requestLocationForegroundPermission] =
    useForegroundPermissions()

  const user = useUser()
  const realm = useRealm()
  const { goBack } = useNavigation()

  const licensePlateRef = useRef<TextInput>(null)
  const descriptionRef = useRef<TextInput>(null)

  async function handleRegisterDeparture() {
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

      if (!currentCoords?.latitude && !currentCoords?.longitude) {
        return Alert.alert(
          'Localização',
          'Não foi possível obter a localização atual do dispositivo. Por favor, verifique as configurações de localização do seu dispositivo.',
        )
      }

      setIsRegistering(true)

      const backgroundPermissions = await requestBackgroundPermissionsAsync()

      if (!backgroundPermissions.granted) {
        setIsRegistering(false)

        return Alert.alert(
          'Localização',
          'Você precisa conceder permissão de localização em segundo plano para registrar a saída do veículo. Por favor, acesse as configurações do seu dispositivo para conceder essa permissão',
        )
      }

      await startBackgroundLocationTask()

      realm.write(() => {
        realm.create(
          'History',
          History.generate({
            license_plate: licensePlate.toUpperCase(),
            user_id: user.id,
            description,
            coords: [
              {
                latitude: currentCoords.latitude,
                longitude: currentCoords.longitude,
                timestamp: new Date().getTime(),
              },
            ],
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

  useEffect(() => {
    requestLocationForegroundPermission()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!locationForegroundPermission?.granted) {
      return
    }

    let subscription: LocationSubscription

    watchPositionAsync(
      {
        accuracy: LocationAccuracy.High,
        timeInterval: 1000,
      },
      (location) => {
        setCurrentCoords(location.coords)

        getAddressLocation(location.coords).then((address) => {
          if (address) {
            setCurrentAddress(address)
          }
        })
      },
    )
      .then((response) => (subscription = response))
      .finally(() => setIsLoadingLocation(false))

    return () => subscription?.remove()
  }, [locationForegroundPermission])

  if (!locationForegroundPermission?.granted) {
    return (
      <Container>
        <Header title="Saída" />

        <Message>
          Você precisa conceder permissão de localização para registrar a saída
          do veículo. Por favor, acesse as configurações do seu dispositivo para
          conceder essa permissão.
        </Message>
      </Container>
    )
  }

  if (isLoadingLocation) {
    return <Loading />
  }

  return (
    <Container>
      <Header title="Saída" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={keyboardAvoidingViewBehavior}
      >
        <ScrollView>
          {currentCoords && <Map coordinates={[currentCoords]} />}

          <Content>
            {currentAddress && (
              <LocationInfo
                icon={Car}
                label="Localização atual"
                description={currentAddress}
              />
            )}

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
