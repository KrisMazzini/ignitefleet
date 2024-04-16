import { NavigationContainer } from '@react-navigation/native'
import Toast from 'react-native-toast-message'

import { AppRoutes } from './app.routes'
import { TopMessage } from '../components/TopMessage'

export function Routes() {
  return (
    <NavigationContainer>
      <AppRoutes />
      <Toast
        config={{ info: ({ text1 }) => <TopMessage title={String(text1)} /> }}
      />
    </NavigationContainer>
  )
}
