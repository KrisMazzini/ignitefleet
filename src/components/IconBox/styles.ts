import styled, { css } from 'styled-components/native'

export type SizeProps = 'SMALL' | 'REGULAR'

type ContainerProps = {
  size: SizeProps
}

const variantSizeStyles = (size: SizeProps) => {
  return {
    SMALL: css`
      width: 32px;
      height: 32px;
    `,

    REGULAR: css`
      width: 46px;
      height: 46px;
    `,
  }[size]
}

export const Container = styled.View<ContainerProps>`
  border-radius: 6px;
  background-color: ${({ theme }) => theme.COLORS.GRAY_700};
  justify-content: center;
  align-items: center;

  margin-right: 12px;

  ${({ size }) => variantSizeStyles(size)}
`
