import dayjs from 'dayjs'
import { TouchableOpacityProps } from 'react-native'
import { useTheme } from 'styled-components/native'
import { Check, ClockClockwise } from 'phosphor-react-native'

import { Container, Departure, Info, LicensePlate } from './styles'

export type HistoryCardProps = {
  id: string
  licensePlate: string
  createdAt: Date
  isSynced: boolean
}

type Props = TouchableOpacityProps & {
  data: HistoryCardProps
}

export function HistoryCard({ data, ...rest }: Props) {
  const { COLORS } = useTheme()

  return (
    <Container activeOpacity={0.7} {...rest}>
      <Info>
        <LicensePlate>{data.licensePlate}</LicensePlate>
        <Departure>
          {dayjs(data.createdAt).format('[Saída em] DD/MM/YYYY [às] HH:mm')}
        </Departure>
      </Info>

      {data.isSynced ? (
        <Check size={24} color={COLORS.BRAND_LIGHT} />
      ) : (
        <ClockClockwise size={24} color={COLORS.GRAY_400} />
      )}
    </Container>
  )
}
