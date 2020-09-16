import {useTimeAgo} from '@sanity/base/hooks'
import {Chunk} from '@sanity/field/diff'
import classNames from 'classnames'
import {upperFirst} from 'lodash'
import CloseIcon from 'part:@sanity/base/close-icon'
import SplitHorizontalIcon from 'part:@sanity/base/split-horizontal-icon'
import Button from 'part:@sanity/components/buttons/default'
import {MenuItemType} from 'part:@sanity/components/menus/default'
import LanguageFilter from 'part:@sanity/desk-tool/language-select-component?'
import React, {useCallback, useState} from 'react'
import {useDeskToolFeatures} from '../../../../features'
import {formatTimelineEventLabel} from '../../timeline'
import {useDocumentPane} from '../../hooks'
import {Path} from '../../types'
import {DocumentPanelContextMenu} from './contextMenu'
import {DocumentHeaderTabs} from './tabs'
import {DocumentHeaderTitle} from './title'
import {ValidationMenu} from './validationMenu'

import styles from './header.css'

export interface DocumentPanelHeaderProps {
  onContextMenuAction: (action: MenuItemType) => void
  onTimelineOpen: () => void
  rev: Chunk | null
  rootElement: HTMLDivElement | null
  scrollToFocusPath: (path: Path) => void
  versionSelectRef: React.MutableRefObject<HTMLDivElement | null>
}

// eslint-disable-next-line complexity
export function DocumentPanelHeader(props: DocumentPanelHeaderProps) {
  const {
    onContextMenuAction,
    onTimelineOpen,
    rev,
    rootElement,
    scrollToFocusPath,
    versionSelectRef
  } = props

  const {
    closePane,
    isClosable,
    isCollapsed,
    isChangesOpen,
    onCollapse,
    onExpand,
    splitPane,
    timelineMode,
    views
  } = useDocumentPane()
  const features = useDeskToolFeatures()
  const [isContextMenuOpen, setContextMenuOpen] = useState(false)
  const [isValidationOpen, setValidationOpen] = React.useState<boolean>(false)

  const handleTitleClick = useCallback(() => {
    if (isCollapsed && onExpand) onExpand()
    if (!isCollapsed && onCollapse) onCollapse()
  }, [isCollapsed, onExpand, onCollapse])

  // This is needed to stop the ClickOutside-handler (in the Popover) to treat the click
  // as an outside-click.
  const ignoreClickOutside = useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.stopPropagation()
  }, [])

  const showTabs = features.splitViews && views.length > 1

  // @todo: remove this
  const showVersionMenu = true // isHistoryOpen
  const menuOpen = isChangesOpen && timelineMode === 'rev'

  return (
    <div className={classNames(styles.root, isCollapsed && styles.isCollapsed)}>
      <div className={styles.mainNav}>
        <div className={styles.title} onClick={handleTitleClick}>
          <strong>
            <DocumentHeaderTitle />
          </strong>
        </div>

        <div className={styles.paneActions}>
          {LanguageFilter && (
            <div>
              <LanguageFilter />
            </div>
          )}

          <div>
            <ValidationMenu
              boundaryElement={rootElement}
              isOpen={isValidationOpen}
              setFocusPath={scrollToFocusPath}
              setOpen={setValidationOpen}
            />
          </div>

          <div>
            <DocumentPanelContextMenu
              boundaryElement={rootElement}
              onAction={onContextMenuAction}
              open={isContextMenuOpen}
              setOpen={setContextMenuOpen}
            />
          </div>

          {features.splitViews && (
            <>
              {splitPane && views.length > 1 && (
                <div>
                  <Button
                    icon={SplitHorizontalIcon}
                    kind="simple"
                    onClick={splitPane}
                    padding="small"
                    title="Split pane right"
                    type="button"
                  />
                </div>
              )}

              {splitPane && isClosable && (
                <div>
                  <Button
                    icon={CloseIcon}
                    kind="simple"
                    onClick={closePane}
                    padding="small"
                    title="Close pane"
                    type="button"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {(showTabs || showVersionMenu) && (
        <div className={styles.viewNav}>
          {showTabs && (
            <div className={styles.tabsContainer}>
              <DocumentHeaderTabs />
            </div>
          )}

          {showVersionMenu && (
            <div className={styles.versionSelectContainer} ref={versionSelectRef}>
              <Button
                kind="simple"
                onMouseUp={ignoreClickOutside}
                onClick={onTimelineOpen}
                padding="small"
                selected={isChangesOpen && timelineMode === 'rev'}
                size="small"
              >
                {/* eslint-disable-next-line no-nested-ternary */}
                {menuOpen ? (
                  <>Select version</>
                ) : rev ? (
                  <TimelineButtonLabel rev={rev} />
                ) : (
                  <>Current version</>
                )}{' '}
                &darr;
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TimelineButtonLabel({rev}: {rev: Chunk}) {
  const timeAgo = useTimeAgo(rev.endTimestamp)

  return (
    <>
      {upperFirst(formatTimelineEventLabel(rev.type))} {timeAgo}
    </>
  )
}
