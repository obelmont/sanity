/* eslint-disable max-depth */
import React, {useCallback} from 'react'
import {
  ObjectDiff,
  DocumentChangeContext,
  DiffAnnotationTooltipContent,
  ChangeList,
  Chunk,
  DocumentChangeContextInstance
} from '@sanity/field/diff'
import CloseIcon from 'part:@sanity/base/close-icon'
import {UserAvatar} from '@sanity/base/components'
import {Tooltip} from 'part:@sanity/components/tooltip'
import Button from 'part:@sanity/components/buttons/default'
import {AvatarStack} from 'part:@sanity/components/avatar'
import {useTimeAgo} from '@sanity/base/hooks'
import {useDocumentPane} from '../hooks'
import {formatTimelineEventLabel} from '../timeline'
import {collectLatestAuthorAnnotations} from './helpers'

import styles from './changesPanel.css'

interface ChangesPanelProps {
  changesSinceSelectRef: React.MutableRefObject<HTMLDivElement | null>
  loading: boolean
  onTimelineOpen: () => void
  since: Chunk | null
}

export function ChangesPanel({
  changesSinceSelectRef,
  loading,
  onTimelineOpen,
  since
}: ChangesPanelProps): React.ReactElement | null {
  const {closeHistory, documentId, historyController, timelineMode, schemaType} = useDocumentPane()
  const diff: ObjectDiff | null = historyController.currentObjectDiff() as any
  const isComparingCurrent = !historyController.onOlderRevision()
  const isTimelineOpen = timelineMode !== 'closed'

  const documentContext: DocumentChangeContextInstance = React.useMemo(
    () => ({
      documentId,
      schemaType,
      rootDiff: diff,
      isComparingCurrent
    }),
    [documentId, schemaType, diff, isComparingCurrent]
  )

  const changeAnnotations = React.useMemo(
    () => (diff ? collectLatestAuthorAnnotations(diff) : []),
    [diff]
  )

  // This is needed to stop the ClickOutside-handler (in the Popover) to treat the click
  // as an outside-click.
  const ignoreClickOutside = useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.stopPropagation()
  }, [])

  const menuOpen = isTimelineOpen && timelineMode === 'since'

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.mainNav}>
          <h2 className={styles.title}>Changes</h2>
          <div className={styles.closeButtonContainer}>
            <Button
              icon={CloseIcon}
              kind="simple"
              onClick={closeHistory}
              padding="small"
              title="Hide changes panel"
              type="button"
            />
          </div>
        </div>
        <div className={styles.versionSelectContainer}>
          <div ref={changesSinceSelectRef} style={{display: 'inline-block'}}>
            <Button
              kind="simple"
              onMouseUp={ignoreClickOutside}
              onClick={onTimelineOpen}
              padding="small"
              selected={isTimelineOpen && timelineMode === 'since'}
              size="small"
            >
              {/* eslint-disable-next-line no-nested-ternary */}
              {menuOpen ? (
                <>Review changes since</>
              ) : since ? (
                <SinceText since={since} />
              ) : (
                <>Since unknown version</>
              )}{' '}
              &darr;
            </Button>
          </div>
          {changeAnnotations.length > 0 && (
            <Tooltip
              content={
                (
                  <DiffAnnotationTooltipContent
                    description="Changes by"
                    annotations={changeAnnotations}
                  />
                ) as any
              }
              placement="top"
            >
              <div className={styles.changeAuthorsContainer}>
                <AvatarStack className={styles.changeAuthorsAvatarStack} maxLength={4}>
                  {changeAnnotations.map(({author}) => (
                    <UserAvatar key={author} userId={author} />
                  ))}
                </AvatarStack>
              </div>
            </Tooltip>
          )}
        </div>
      </header>

      <div className={styles.body}>
        {loading || !diff ? (
          <div>Loading…</div>
        ) : (
          <DocumentChangeContext.Provider value={documentContext}>
            <div className={styles.changeList}>
              <ChangeList diff={diff} schemaType={schemaType} />
            </div>
          </DocumentChangeContext.Provider>
        )}
      </div>
    </div>
  )
}

function SinceText({since}: {since: Chunk}): React.ReactElement {
  const timeAgo = useTimeAgo(since.endTimestamp)

  return (
    <>
      Since {formatTimelineEventLabel(since.type)} {timeAgo}
    </>
  )
}
