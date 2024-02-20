import { useEffect, useState } from 'react'
import { Alert, FlatList } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { Container, Content, Label, Title } from './styles'

import { CarStatus } from '../../components/CarStatus'
import { HomeHeader } from '../../components/HomeHeader'
import { HistoryCard, HistoryCardProps } from '../../components/HistoryCard'

import { useQuery, useRealm } from '../../libs/realm'
import { History } from '../../libs/realm/schemas/History'

export function Home() {
  const [vehicleHistory, setVehicleHistory] = useState<HistoryCardProps[]>([])
  const [vehicleInUse, setVehicleInUse] = useState<History | null>(null)

  const { navigate } = useNavigation()

  const history = useQuery(History)
  const realm = useRealm()

  function handleRegisterMovement() {
    if (vehicleInUse?._id) {
      return navigate('arrival', { id: vehicleInUse._id.toString() })
    }

    navigate('departure')
  }

  function handleHistoryDetails(historyId: string) {
    navigate('arrival', { id: historyId })
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
    function fetchHistory() {
      try {
        const vehicles = history.filtered(
          "status = 'arrival' SORT(created_at DESC)",
        )

        const formattedVehicles = vehicles.map((vehicle) => {
          return {
            id: vehicle._id.toString(),
            licensePlate: vehicle.license_plate,
            createdAt: vehicle.created_at,
            isSynced: false,
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

    fetchHistory()

    realm.addListener('change', fetchHistory)

    return () => {
      if (realm && !realm.isClosed) {
        realm.removeListener('change', fetchHistory)
      }
    }
  }, [realm, history])

  return (
    <Container>
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
