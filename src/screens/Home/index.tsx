import { useNavigation } from '@react-navigation/native'

import { Container, Content } from './styles'

import { CarStatus } from '../../components/CarStatus'
import { HomeHeader } from '../../components/HomeHeader'

export function Home() {
  const { navigate } = useNavigation()

  function handleRegisterMovement() {
    navigate('departure')
  }

  return (
    <Container>
      <HomeHeader />

      <Content>
        <CarStatus onPress={handleRegisterMovement} />
      </Content>
    </Container>
  )
}
