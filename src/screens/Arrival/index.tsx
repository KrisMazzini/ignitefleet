import { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Alert } from 'react-native'
import { LatLng } from 'react-native-maps'
import { BSON } from 'realm'
import { X } from 'phosphor-react-native'
import dayjs from 'dayjs'

import {
  AsyncMessage,
  Container,
  Content,
  Description,
  Footer,
  Label,
  LicensePlate,
} from './styles'

import { Loading } from '../../components/Loading'
import { Header } from '../../components/Header'
import { Button } from '../../components/Button'
import { ButtonIcon } from '../../components/ButtonIcon'
import { Locations } from '../../components/Locations'
import { Map } from '../../components/Map'
import { LocationInfoProps } from '../../components/LocationInfo'

import { getLastSyncTimestamp } from '../../libs/asyncStorage/syncStorage'
import { getStorageLocations } from '../../libs/asyncStorage/locationStorage'
import { useObject, useRealm } from '../../libs/realm'
import { History } from '../../libs/realm/schemas/History'

import { getAddressLocation } from '../../utils/getAddressLocation'
import { stopBackgroundLocationTask } from '../../tasks/backgroundLocationTask'

type RouteParamsProps = {
  id: string
}

export function Arrival() {
  const [dataSynced, setDataSynced] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [coordinates, setCoordinates] = useState<LatLng[]>([])
  const [departure, setDeparture] = useState<LocationInfoProps>(
    {} as LocationInfoProps,
  )
  const [arrival, setArrival] = useState<LocationInfoProps | undefined>()

  const route = useRoute()
  const { id } = route.params as RouteParamsProps

  const history = useObject(History, new BSON.UUID(id) as unknown as string)
  const realm = useRealm()

  const { goBack } = useNavigation()

  async function handleRegisterArrival() {
    try {
      if (!history) {
        return Alert.alert(
          'Erro',
          'Não foi possível obter os dados para registrar a chegada  do veículo.',
        )
      }

      const locations = await getStorageLocations()

      realm.write(() => {
        history.status = 'arrival'
        history.updated_at = new Date()
        history.coords.push(...locations)
      })

      await stopBackgroundLocationTask()

      Alert.alert('Chegada', 'Chegada registrada com sucesso.')

      goBack()
    } catch (error) {
      console.log(error)
      Alert.alert('Erro', 'Não foi possível registrar a chegada do veículo.')
    }
  }

  function handleCancelVehicleUsage() {
    Alert.alert('Cancelar uso', 'Deseja cancelar o uso do veículo?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: () => cancelVehicleUsage() },
    ])
  }

  async function cancelVehicleUsage() {
    realm.write(() => {
      realm.delete(history)
    })

    await stopBackgroundLocationTask()

    goBack()
  }

  useEffect(() => {
    async function getLocationsInfo() {
      const lastSync = await getLastSyncTimestamp()
      const updatedAt = history?.updated_at.getTime()

      setDataSynced(!!lastSync && !!updatedAt && lastSync > updatedAt)

      const firstLocation = history?.coords[0]

      if (firstLocation) {
        const departureStreetName = await getAddressLocation({
          latitude: firstLocation.latitude,
          longitude: firstLocation.longitude,
        })

        setDeparture({
          label: `Saindo de ${departureStreetName ?? 'Local desconhecido'}`,
          description: dayjs(firstLocation.timestamp).format(
            'DD/MM/YYYY [às] HH:mm',
          ),
        })
      }

      if (history?.status === 'departure') {
        const storageLocations = await getStorageLocations()
        setCoordinates(storageLocations)

        return
      }

      const coords = history?.coords.map((coord) => ({
        latitude: coord.latitude,
        longitude: coord.longitude,
      }))

      setCoordinates(coords ?? [])

      const lastLocation = history?.coords.at(-1)

      if (lastLocation) {
        const arrivalStreetName = await getAddressLocation({
          latitude: lastLocation.latitude,
          longitude: lastLocation.longitude,
        })

        setArrival({
          label: `Chegando em ${arrivalStreetName ?? 'Local desconhecido'}`,
          description: dayjs(lastLocation.timestamp).format(
            'DD/MM/YYYY [às] HH:mm',
          ),
        })
      }
    }

    getLocationsInfo()
    setIsLoading(false)
  }, [history])

  if (isLoading) {
    return <Loading />
  }

  return (
    <Container>
      <Header
        title={history?.status === 'departure' ? 'Chegada' : 'Detalhes'}
      />

      {coordinates.length > 0 && <Map coordinates={coordinates} />}

      <Content>
        <Locations departure={departure} arrival={arrival} />

        <Label>Placa do veículo</Label>
        <LicensePlate>{history?.license_plate}</LicensePlate>

        <Label>Finalidade</Label>
        <Description>{history?.description}</Description>
      </Content>

      {!dataSynced && (
        <AsyncMessage>
          Sincronização da{' '}
          {history?.status === 'departure' ? 'partida' : 'chegada'} pendente
        </AsyncMessage>
      )}

      {history?.status === 'departure' && (
        <Footer>
          <ButtonIcon icon={X} onPress={handleCancelVehicleUsage} />
          <Button title="Registrar Chegada" onPress={handleRegisterArrival} />
        </Footer>
      )}
    </Container>
  )
}
