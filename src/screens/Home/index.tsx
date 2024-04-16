import { useEffect, useState } from 'react'
import { Alert, FlatList } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Realm, useUser } from '@realm/react'
import { CloudArrowUp } from 'phosphor-react-native'
import Toast from 'react-native-toast-message'

import { Container, Content, Label, Title } from './styles'

import { CarStatus } from '../../components/CarStatus'
import { HomeHeader } from '../../components/HomeHeader'
import { HistoryCard, HistoryCardProps } from '../../components/HistoryCard'
import { TopMessage } from '../../components/TopMessage'

import { useQuery, useRealm } from '../../libs/realm'
import { History } from '../../libs/realm/schemas/History'
import {
  getLastSyncTimestamp,
  saveLastSyncTimestamp,
} from '../../libs/asyncStorage/syncStorage'

export function Home() {
  const [vehicleHistory, setVehicleHistory] = useState<HistoryCardProps[]>([])
  const [vehicleInUse, setVehicleInUse] = useState<History | null>(null)
  const [percentageToSync, setPercentageToSync] = useState<string | null>(null)

  const { navigate } = useNavigation()

  const history = useQuery(History)
  const realm = useRealm()
  const user = useUser()

  function handleRegisterMovement() {
    if (vehicleInUse?._id) {
      return navigate('arrival', { id: vehicleInUse._id.toString() })
    }

    navigate('departure')
  }

  function handleHistoryDetails(historyId: string) {
    navigate('arrival', { id: historyId })
  }

  async function fetchHistory() {
    try {
      const vehicles = history.filtered(
        "status = 'arrival' SORT(created_at DESC)",
      )

      const lastSync = await getLastSyncTimestamp()

      const formattedVehicles = vehicles.map((vehicle) => {
        return {
          id: vehicle._id.toString(),
          licensePlate: vehicle.license_plate,
          createdAt: vehicle.created_at,
          isSynced: !!lastSync && lastSync > vehicle.updated_at.getTime(),
        }
      })

      setVehicleHistory(formattedVehicles)
    } catch (error) {
      console.log(error)

      Alert.alert(
        'Histórico',
        'Não foi possível carregar o histórico de veículos.',
      )
    }
  }

  useEffect(() => {
    function fetchVehicleInUse() {
      try {
        const vehicle = history.filtered("status = 'departure'")[0]
        setVehicleInUse(vehicle)
      } catch (error) {
        console.log(error)

        Alert.alert(
          'Veículo em uso',
          'Não foi possível carregar o veículo em uso.',
        )
      }
    }

    fetchVehicleInUse()

    realm.addListener('change', fetchVehicleInUse)

    return () => {
      if (realm && !realm.isClosed) {
        realm.removeListener('change', fetchVehicleInUse)
      }
    }
  }, [realm, history])

  useEffect(() => {
    fetchHistory()

    realm.addListener('change', fetchHistory)

    return () => {
      if (realm && !realm.isClosed) {
        realm.removeListener('change', fetchHistory)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realm, history])

  useEffect(() => {
    realm.subscriptions.update((mutableSubs, realm) => {
      const historyByUserQuery = realm
        .objects('History')
        .filtered(`user_id = '${user.id}'`)

      mutableSubs.add(historyByUserQuery, { name: 'history_by_user' })
    })
  }, [realm, user.id])

  useEffect(() => {
    async function progressNotification(
      transferred: number,
      transferable: number,
    ) {
      const transferPercentage = (transferred / transferable) * 100

      if (transferPercentage === 100) {
        await saveLastSyncTimestamp()
        await fetchHistory()
        setPercentageToSync(null)

        Toast.show({
          type: 'info',
          text1: 'Todos os dados estão sincronizados.',
        })
      }

      if (transferPercentage < 100) {
        setPercentageToSync(`${transferPercentage.toFixed(0)}% sincronizado.`)
      }
    }

    const syncSession = realm.syncSession

    if (!syncSession) {
      return
    }

    syncSession.addProgressNotification(
      Realm.ProgressDirection.Upload,
      Realm.ProgressMode.ReportIndefinitely,
      progressNotification,
    )

    return () => syncSession.removeProgressNotification(progressNotification)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realm.syncSession])

  return (
    <Container>
      {percentageToSync && (
        <TopMessage title={percentageToSync} icon={CloudArrowUp} />
      )}

      <HomeHeader />

      <Content>
        <CarStatus
          licensePlate={vehicleInUse?.license_plate}
          onPress={handleRegisterMovement}
        />

        <Title>Histórico</Title>

        <FlatList
          data={vehicleHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryCard
              data={item}
              onPress={() => handleHistoryDetails(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={() => (
            <Label>Nenhum registro de utilização.</Label>
          )}
        />
      </Content>
    </Container>
  )
}
