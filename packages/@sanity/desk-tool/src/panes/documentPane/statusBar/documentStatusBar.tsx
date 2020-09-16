import React from 'react'
import {useEditState} from '@sanity/react-hooks'
import resolveDocumentBadges from 'part:@sanity/base/document-badges/resolver'
import {useDocumentPane} from '../hooks'
import styles from './documentStatusBar.css'
import {DocumentStatusBarActions, HistoryStatusBarActions} from './documentStatusBarActions'
import {DocumentStatusBarSparkline} from './documentStatusBarSparkline'

export function DocumentStatusBar() {
  const {documentId, documentType, openHistory, historyController, value} = useDocumentPane()
  const editState = useEditState(documentId, documentType)

  const lastUpdated = value && value._updatedAt
  const badges = editState ? resolveDocumentBadges(editState) : []
  const showingRevision = historyController.onOlderRevision()
  const revision = historyController.revTime?.id || ''

  return (
    <div className={styles.root}>
      <div className={styles.status}>
        <button
          className={styles.lastUpdatedButton}
          onClick={openHistory}
          type="button"
          disabled={showingRevision}
        >
          <DocumentStatusBarSparkline
            editState={editState}
            badges={badges}
            disabled={showingRevision}
            lastUpdated={lastUpdated}
          />
        </button>
      </div>

      <div className={styles.actions}>
        <div className={styles.actionsWrapper}>
          {showingRevision ? (
            <HistoryStatusBarActions id={documentId} type={documentType} revision={revision} />
          ) : (
            <DocumentStatusBarActions id={documentId} type={documentType} />
          )}
        </div>
      </div>
    </div>
  )
}
