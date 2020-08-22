/* eslint-disable @typescript-eslint/explicit-function-return-type */

import React, {useCallback} from 'react'
import TimeAgo from '../../../../components/TimeAgo'
import {useDocumentPane} from '../../use'
import {DocumentStatusBarActions} from './documentStatusBarActions'
import {DocumentStatusBarBadges} from './documentStatusBarBadges'
import {SyncState} from './syncState'

import styles from './documentStatusBar.css'

interface Props {
  lastUpdated?: string
}

export function DocumentStatusBar(props: Props) {
  const {toggleHistory} = useDocumentPane()
  const handleToggleHistory = useCallback(() => toggleHistory('-'), [toggleHistory])

  return (
    <div className={styles.root}>
      <div className={styles.status}>
        <div className={styles.statusBadgesContainer}>
          <DocumentStatusBarBadges />
        </div>
        <div className={styles.statusDetails}>
          <button className={styles.lastUpdatedButton} onClick={handleToggleHistory} type="button">
            {props.lastUpdated ? (
              <>
                Updated <TimeAgo time={props.lastUpdated} />
              </>
            ) : (
              'Empty'
            )}
          </button>
          <SyncState />
        </div>
      </div>
      <div className={styles.actions}>
        <div className={styles.actionsWrapper}>
          <DocumentStatusBarActions />
        </div>
      </div>
    </div>
  )
}
