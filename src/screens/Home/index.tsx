import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { Container, Content } from './styles'

import { CarStatus } from '../../components/CarStatus'
import { HomeHeader } from '../../components/HomeHeader'

import { useQuery, useRealm } from '../../libs/realm'
import { History } from '../../libs/realm/schemas/History'

export function Home() {
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
    return () => realm.removeListener('change', fetchVehicleInUse)
  }, [realm, history])

  return (
    <Container>
      <HomeHeader />

      <Content>
        <CarStatus
          licensePlate={vehicleInUse?.license_plate}
          onPress={handleRegisterMovement}
        />
      </Content>
    </Container>
  )
}
