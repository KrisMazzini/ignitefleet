/* eslint-disable camelcase */
import 'react-native-get-random-values'
import './src/libs/dayjs'

import { StatusBar } from 'react-native'
import { ThemeProvider } from 'styled-components'
import { AppProvider, UserProvider } from '@realm/react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto'

import theme from './src/theme'

import { REALM_APP_ID } from '@env'

import { RealmProvider } from './src/libs/realm'
import { Routes } from './src/routes'

import { SignIn } from './src/screens/SignIn'
import { Loading } from './src/components/Loading'

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold })

  return (
    <AppProvider id={REALM_APP_ID}>
      <ThemeProvider theme={theme}>
        <SafeAreaProvider
          style={{ flex: 1, backgroundColor: theme.COLORS.GRAY_800 }}
        >
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />

          {fontsLoaded ? (
            <UserProvider fallback={SignIn}>
              <RealmProvider>
                <Routes />
              </RealmProvider>
            </UserProvider>
          ) : (
            <Loading />
          )}
        </SafeAreaProvider>
      </ThemeProvider>
    </AppProvider>
  )
}
