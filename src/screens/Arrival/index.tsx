import { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Alert } from 'react-native'
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

import { getLastSyncTimestamp } from '../../libs/asyncStorage/syncStorage'
import { useObject, useRealm } from '../../libs/realm'
import { History } from '../../libs/realm/schemas/History'

type RouteParamsProps = {
  id: string
}

export function Arrival() {
  const [dataSynced, setDataSynced] = useState(true)

  const route = useRoute()
  const { id } = route.params as RouteParamsProps

  const history = useObject(History, new BSON.UUID(id) as unknown as string)
  const realm = useRealm()

  const { goBack } = useNavigation()

  function handleRegisterArrival() {
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

  function cancelVehicleUsage() {
    realm.write(() => {
      realm.delete(history)
    })

    goBack()
  }

  useEffect(() => {
    getLastSyncTimestamp().then((lastSync) =>
      setDataSynced(
        !!lastSync && !!history && lastSync > history?.updated_at.getTime(),
      ),
    )
  }, [history])

  return (
    <Container>
      <Header
        title={history?.status === 'departure' ? 'Chegada' : 'Detalhes'}
      />

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
