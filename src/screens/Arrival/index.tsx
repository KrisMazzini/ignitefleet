import { useRoute } from '@react-navigation/native'
import { X } from 'phosphor-react-native'

import {
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

type RouteParamsProps = {
  id: string
}

export function Arrival() {
  const route = useRoute()
  const { id } = route.params as RouteParamsProps

  return (
    <Container>
      <Header title="Chegada" />

      <Content>
        <Label>Placa do veículo</Label>
        <LicensePlate>BRA1234</LicensePlate>

        <Label>Finalidade</Label>
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloribus
          quod mollitia molestias voluptatem, eligendi officiis. Aperiam sequi
          possimus alias ad eius rem. Praesentium molestiae unde deserunt minus
          sunt veniam modi.
        </Description>

        <Footer>
          <ButtonIcon icon={X} />
          <Button title="Registrar Chegada" />
        </Footer>
      </Content>
    </Container>
  )
}
