import { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Alert } from 'react-native'
import { LatLng } from 'react-native-maps'
import { BSON } from 'realm'
import { X } from 'phosphor-react-native'

import {
  AsyncMessage,
  Container,
  Content,
  Description,
  Footer,
  Label,
  LicensePlate,
} from './styles'

import { Header } from '../../components/Header'
import { Button } from '../../components/Button'
import { ButtonIcon } from '../../components/ButtonIcon'
import { Map } from '../../components/Map'

import { getLastSyncTimestamp } from '../../libs/asyncStorage/syncStorage'
import { getStorageLocations } from '../../libs/asyncStorage/locationStorage'
import { useObject, useRealm } from '../../libs/realm'
import { History } from '../../libs/realm/schemas/History'

import { stopBackgroundLocationTask } from '../../tasks/backgroundLocationTask'

type RouteParamsProps = {
  id: string
}

export function Arrival() {
  const [dataSynced, setDataSynced] = useState(true)
  const [coordinates, setCoordinates] = useState<LatLng[]>([])

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

      realm.write(() => {
        history.status = 'arrival'
        history.updated_at = new Date()
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

      const storageLocations = await getStorageLocations()
      setCoordinates(storageLocations)
    }

    getLocationsInfo()
  }, [history])

  return (
    <Container>
      <Header
        title={history?.status === 'departure' ? 'Chegada' : 'Detalhes'}
      />

      {coordinates.length > 0 && <Map coordinates={coordinates} />}

      <Content>
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
