import { TouchableOpacityProps } from 'react-native'
import { useTheme } from 'styled-components/native'
import { Key, Car } from 'phosphor-react-native'

import { Container, IconBox, Message, TextHighlight } from './styles'

type CarStatusProps = TouchableOpacityProps & {
  licensePlate?: string
}

export function CarStatus({ licensePlate, ...rest }: CarStatusProps) {
  const { COLORS } = useTheme()

  const Icon = licensePlate ? Car : Key
  const status = licensePlate ? 'chegada' : 'saída'
  const message = licensePlate
    ? `Veículo ${licensePlate} em uso.`
    : `Nenhum veículo em uso.`

  return (
    <Container {...rest}>
      <IconBox>
        <Icon size={32} color={COLORS.BRAND_LIGHT} />
      </IconBox>

      <Message>
        {message}{' '}
        <TextHighlight>Clique aqui para registrar a {status}</TextHighlight>
      </Message>
    </Container>
  )
}
