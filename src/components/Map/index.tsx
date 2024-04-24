import { useRef } from 'react'
import { Car, FlagCheckered } from 'phosphor-react-native'
import { useTheme } from 'styled-components/native'

import MapView, {
  MapViewProps,
  PROVIDER_DEFAULT,
  LatLng,
  Marker,
  Polyline,
} from 'react-native-maps'

import { IconBox } from '../IconBox'

type Props = MapViewProps & {
  coordinates: LatLng[]
}

export function Map({ coordinates, ...rest }: Props) {
  const { COLORS } = useTheme()
  const mapRef = useRef<MapView>(null)

  const firstCoordinate = coordinates[0]
  const lastCoordinate = coordinates[coordinates.length - 1]

  async function onMapReady() {
    if (coordinates.length > 1) {
      mapRef.current?.fitToSuppliedMarkers(['departure', 'arrival'], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      })
    }
  }

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      style={{
        width: '100%',
        height: 200,
      }}
      region={{
        latitude: lastCoordinate.latitude,
        longitude: lastCoordinate.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
      onMapReady={onMapReady}
      zoomEnabled={true}
      {...rest}
    >
      <Marker identifier="departure" coordinate={firstCoordinate}>
        <IconBox size="SMALL" icon={Car} />
      </Marker>

      {coordinates.length > 1 && (
        <>
          <Marker identifier="arrival" coordinate={lastCoordinate}>
            <IconBox size="SMALL" icon={FlagCheckered} />
          </Marker>

          <Polyline
            coordinates={coordinates}
            strokeColor={COLORS.GRAY_700}
            strokeWidth={5}
          />
        </>
      )}
    </MapView>
  )
}
