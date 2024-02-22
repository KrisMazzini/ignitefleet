/* eslint-disable camelcase */
import 'react-native-get-random-values'
import './src/libs/dayjs'

import { StatusBar } from 'react-native'
import { ThemeProvider } from 'styled-components'
import { AppProvider, UserProvider } from '@realm/react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useNetInfo } from '@react-native-community/netinfo'

import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto'
import { WifiSlash } from 'phosphor-react-native'

import theme from './src/theme'

import { REALM_APP_ID } from '@env'

import { RealmProvider, syncConfig } from './src/libs/realm'
import { Routes } from './src/routes'

import { SignIn } from './src/screens/SignIn'
import { Loading } from './src/components/Loading'
import { TopMessage } from './src/components/TopMessage'

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold })
  const netInfo = useNetInfo()

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

          {!netInfo.isConnected && (
            <TopMessage title="Você está offline." icon={WifiSlash} />
          )}

          {fontsLoaded ? (
            <UserProvider fallback={SignIn}>
              <RealmProvider sync={syncConfig} fallback={Loading}>
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
