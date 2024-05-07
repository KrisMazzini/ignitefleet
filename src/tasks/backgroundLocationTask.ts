import * as TaskManager from 'expo-task-manager'

import {
  Accuracy,
  hasStartedLocationUpdatesAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
} from 'expo-location'

import {
  clearStorageLocations,
  saveStorageLocation,
} from '../libs/asyncStorage/locationStorage'

export const BACKGROUND_TASK_NAME = 'location-tracking'

TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }: any) => {
  try {
    if (error) {
      throw error
    }

    if (!data) {
      return
    }

    const { coords, timestamp } = data.locations[0]

    const currentLocation = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      timestamp,
    }

    await saveStorageLocation(currentLocation)
  } catch (error) {
    console.log(error)
    stopBackgroundLocationTask()
  }
})

export async function startBackgroundLocationTask() {
  try {
    const hasTaskStarted =
      await hasStartedLocationUpdatesAsync(BACKGROUND_TASK_NAME)

    if (hasTaskStarted) {
      await stopLocationUpdatesAsync(BACKGROUND_TASK_NAME)
    }

    await startLocationUpdatesAsync(BACKGROUND_TASK_NAME, {
      accuracy: Accuracy.Highest,
      distanceInterval: 1,
      timeInterval: 1000,
    })
  } catch (error) {
    console.log(error)
  }
}

export async function stopBackgroundLocationTask() {
  try {
    const hasTaskStarted =
      await hasStartedLocationUpdatesAsync(BACKGROUND_TASK_NAME)

    if (hasTaskStarted) {
      await stopLocationUpdatesAsync(BACKGROUND_TASK_NAME)
      await clearStorageLocations()
    }

    await TaskManager.unregisterTaskAsync(BACKGROUND_TASK_NAME)
  } catch (error) {
    console.log(error)
  }
}
