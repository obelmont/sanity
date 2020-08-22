/* eslint-disable @typescript-eslint/explicit-function-return-type */

import * as React from 'react'
import {useSyncState, useConnectionState} from '@sanity/react-hooks'
import CheckIcon from 'part:@sanity/base/check-icon'
import SyncIcon from 'part:@sanity/base/sync-icon'
import {useDocument} from '../../utils/document'

import styles from './syncState.css'

export function SyncState() {
  const doc = useDocument()
  const {isSyncing} = useSyncState(doc.id)
  const connectionState = useConnectionState(doc.id, doc.typeName)

  const isConnected = connectionState === 'connected'

  const icon = isSyncing || !isConnected ? <SyncIcon /> : <CheckIcon />
  const className = isSyncing
    ? styles.isSyncing
    : !isConnected
    ? styles.isDisconnected
    : styles.statusIcon

  return <span className={className}>{icon}</span>
}
