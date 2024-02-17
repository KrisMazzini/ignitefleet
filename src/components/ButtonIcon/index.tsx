import { useTheme } from 'styled-components/native'
import { IconProps } from 'phosphor-react-native'

import { Container } from './styles'

export type IconBoxProps = (props: IconProps) => JSX.Element

type ButtonIconProps = {
  icon: IconBoxProps
}

export function ButtonIcon({ icon: Icon, ...rest }: ButtonIconProps) {
  const { COLORS } = useTheme()

  return (
    <Container activeOpacity={0.7} {...rest}>
      <Icon size={24} color={COLORS.BRAND_MID} />
    </Container>
  )
}
