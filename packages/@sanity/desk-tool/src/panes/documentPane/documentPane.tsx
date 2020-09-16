import {Chunk} from '@sanity/field/diff'
import classNames from 'classnames'
import {ClickOutside} from 'part:@sanity/components/click-outside'
import {Popover} from 'part:@sanity/components/popover'
import Snackbar from 'part:@sanity/components/snackbar/default'
import React, {useCallback, useRef, useState} from 'react'
import {useDeskToolFeatures} from '../../features'
import {ChangesPanel} from './changesPanel'
import {DocumentPanel, getProductionPreviewItem} from './documentPanel'
import {DocumentOperationResults} from './documentOperationResults'
import {useDocumentPane} from './hooks'
import {InspectDialog} from './inspectDialog'
import {DocumentActionShortcuts, isInspectHotkey, isPreviewHotkey} from './keyboardShortcuts'
import {DocumentStatusBar} from './statusBar'
import {Timeline, sinceTimelineProps, revTimelineProps} from './timeline'

import styles from './documentPane.css'

// eslint-disable-next-line complexity
export function DocumentPane() {
  const {
    connectionState,
    historyController,
    isChangesOpen,
    isCollapsed,
    isInspectOpen,
    isSelected,
    timelineMode,
    toggleInspect,
    selectRev,
    setTimelineMode,
    setTimelineRange,
    value
  } = useDocumentPane()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const features = useDeskToolFeatures()
  const historyState = historyController.selectionState
  const [showValidationTooltip, setShowValidationTooltip] = useState<boolean>(false)

  const handleKeyUp = useCallback(
    (event: any) => {
      if (event.key === 'Escape' && showValidationTooltip) {
        setShowValidationTooltip(false)
      }

      if (isInspectHotkey(event)) {
        toggleInspect()
      }

      if (isPreviewHotkey(event)) {
        const item = getProductionPreviewItem({
          features,
          value,
          rev: null
        })

        if (item && item.url) {
          window.open(item.url)
        }
      }
    },
    [features, showValidationTooltip, toggleInspect, value]
  )

  const handleInspectClose = useCallback(() => {
    toggleInspect(false)
  }, [toggleInspect])

  const changesSinceSelectRef = useRef<HTMLDivElement | null>(null)
  const versionSelectRef = useRef<HTMLDivElement | null>(null)

  const selectSince = useCallback(
    (sinceChunk: Chunk) => {
      const [sinceId, revId] = historyController.findRangeForNewSince(sinceChunk)
      setTimelineMode('closed')
      setTimelineRange(sinceId, revId)
    },
    [historyController, setTimelineRange, setTimelineMode]
  )

  const loadMoreHistory = useCallback(
    (state: boolean) => {
      historyController.setLoadMore(state)
    },
    [historyController]
  )

  const handleTimelineClose = useCallback(() => {
    setTimelineMode('closed')
  }, [setTimelineMode])

  const handleTimelineSince = useCallback(() => {
    setTimelineMode(timelineMode === 'since' ? 'closed' : 'since')
  }, [timelineMode, setTimelineMode])

  const handleTimelineRev = useCallback(() => {
    setTimelineMode(timelineMode === 'rev' ? 'closed' : 'rev')
  }, [timelineMode, setTimelineMode])

  const isTimelineOpen = timelineMode !== 'closed'

  const popoverContent = (
    <ClickOutside onClickOutside={handleTimelineClose}>
      {ref =>
        timelineMode === 'rev' ? (
          <Timeline
            ref={ref as any}
            onSelect={selectRev}
            onLoadMore={loadMoreHistory}
            {...revTimelineProps(historyController.realRevChunk)}
          />
        ) : (
          <Timeline
            ref={ref as any}
            onSelect={selectSince}
            onLoadMore={loadMoreHistory}
            {...sinceTimelineProps(historyController.sinceTime!, historyController.realRevChunk)}
          />
        )
      }
    </ClickOutside>
  )

  return (
    <Popover
      content={popoverContent}
      open={isTimelineOpen}
      placement="bottom"
      targetElement={
        timelineMode === 'rev' ? versionSelectRef.current : changesSinceSelectRef.current
      }
    >
      <DocumentActionShortcuts
        onKeyUp={handleKeyUp}
        className={classNames([
          styles.root,
          isCollapsed && styles.isCollapsed,
          isSelected ? styles.isActive : styles.isDisabled
        ])}
        rootRef={rootRef}
      >
        <div className={styles.documentAndChangesContainer}>
          <div className={styles.documentContainer}>
            {isInspectOpen && <InspectDialog value={value} onClose={handleInspectClose} />}

            <DocumentPanel
              onTimelineOpen={handleTimelineRev}
              rootElement={rootRef.current}
              versionSelectRef={versionSelectRef}
            />
          </div>

          {features.reviewChanges && !isCollapsed && isChangesOpen && (
            <div className={styles.changesContainer}>
              <ChangesPanel
                changesSinceSelectRef={changesSinceSelectRef}
                loading={historyState === 'loading'}
                onTimelineOpen={handleTimelineSince}
                since={historyController.sinceTime}
              />
            </div>
          )}
        </div>

        <div className={styles.footerContainer}>
          <DocumentStatusBar />
        </div>

        {connectionState === 'reconnecting' && (
          <Snackbar kind="warning" isPersisted title="Connection lost. Reconnecting…" />
        )}

        <DocumentOperationResults />
      </DocumentActionShortcuts>
    </Popover>
  )
}
