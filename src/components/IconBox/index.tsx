import { IconProps } from 'phosphor-react-native'
import { useTheme } from 'styled-components/native'

import { Container, SizeProps } from './styles'

export type IconBoxProps = (props: IconProps) => JSX.Element

type Props = {
  size?: SizeProps
  icon: IconBoxProps
}

export function IconBox({ size = 'REGULAR', icon: Icon }: Props) {
  const { COLORS } = useTheme()
  const iconSize = size === 'REGULAR' ? 24 : 16

  return (
    <Container size={size}>
      <Icon size={iconSize} color={COLORS.BRAND_LIGHT} />
    </Container>
  )
}
