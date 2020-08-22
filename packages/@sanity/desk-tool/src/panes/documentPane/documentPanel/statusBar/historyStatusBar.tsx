import React from 'react'
import TimeAgo from '../../../../components/TimeAgo'
import {HistoryStatusBarActions} from './documentStatusBarActions'

import styles from './documentStatusBar.css'

export function HistoryStatusBar() {
  return (
    <div className={styles.root}>
      <div className={styles.status}>
        <div className={styles.statusDetails}>
          Changed <TimeAgo time={100} />
          (latest)
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.actionsWrapper}>
          <HistoryStatusBarActions revision={'TODO'} />
        </div>
      </div>
    </div>
  )
}
