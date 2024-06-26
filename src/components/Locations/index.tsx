import { Car, FlagCheckered } from 'phosphor-react-native'

import { Container, Line } from './styles'

import { LocationInfo, LocationInfoProps } from '../LocationInfo'

type LocationsProps = {
  departure: LocationInfoProps
  arrival?: LocationInfoProps
}

export function Locations({ departure, arrival }: LocationsProps) {
  return (
    <Container>
      <LocationInfo
        icon={Car}
        label={departure.label}
        description={departure.description}
      />

      {arrival && (
        <>
          <Line />

          <LocationInfo
            icon={FlagCheckered}
            label={arrival.label}
            description={arrival.description}
          />
        </>
      )}
    </Container>
  )
}
