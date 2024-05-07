/* eslint-disable @typescript-eslint/no-explicit-any */
import { Realm, createRealmContext } from '@realm/react'

import { History } from './schemas/History'
import { Coords } from './schemas/Coords'

const realmAccessBehavior: Realm.OpenRealmBehaviorConfiguration = {
  type: Realm.OpenRealmBehaviorType.OpenImmediately,
}

export const syncConfig: any = {
  flexible: true,
  newRealmFileBehavior: realmAccessBehavior,
  existingRealmFileBehavior: realmAccessBehavior,
}

export const { RealmProvider, useRealm, useQuery, useObject } =
  createRealmContext({
    schema: [History, Coords],
    schemaVersion: 0,
  })
