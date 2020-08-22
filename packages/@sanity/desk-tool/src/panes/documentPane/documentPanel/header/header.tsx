import classNames from 'classnames'
import {negate} from 'lodash'
import CloseIcon from 'part:@sanity/base/close-icon'
import SplitHorizontalIcon from 'part:@sanity/base/split-horizontal-icon'
import LanguageFilter from 'part:@sanity/desk-tool/language-select-component?'
import React, {useCallback, useState} from 'react'
import {DocumentView, MenuAction} from '../../types'
import {useDocumentPane} from '../../use'
import {DocumentPanelContextMenu} from './contextMenu'
import {DocumentHeaderTabs} from './tabs'
import {TimelineDropdown} from './timelineDropdown'
import {ValidationMenu} from './validationMenu'

import styles from './header.css'

export interface DocumentPanelHeaderProps {
  activeViewId?: string
  menuItems: MenuAction[]
  onContextMenuAction: (action: MenuAction) => void
  setFocusPath: (path: any) => void
  title: React.ReactNode
  views: DocumentView[]
}

const isActionButton = (item: MenuAction) => (item as any).showAsAction
const isMenuButton = negate(isActionButton)

export function DocumentPanelHeader(props: DocumentPanelHeaderProps) {
  const {activeViewId, menuItems, onContextMenuAction, setFocusPath, title, views} = props
  const {closePane, isClosable, isCollapsed, onCollapse, onExpand, splitPane} = useDocumentPane()
  const contextMenuItems = menuItems.filter(isMenuButton)
  const [isContextMenuOpen, setContextMenuOpen] = useState(false)
  const [isVersionSelectOpen, setVersionSelectOpen] = useState(false)
  const [isValidationOpen, setValidationOpen] = React.useState<boolean>(false)

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuOpen(false)
  }, [])

  const handleToggleContextMenu = useCallback(() => {
    setContextMenuOpen(!isContextMenuOpen)
  }, [isContextMenuOpen])

  const handleVersionsSelectClick = useCallback(() => {
    setVersionSelectOpen(!isVersionSelectOpen)
  }, [isVersionSelectOpen])

  const handleCloseValidationResults = useCallback(() => {
    setValidationOpen(false)
  }, [])

  const handleToggleValidationResults = useCallback(() => {
    setValidationOpen(!isValidationOpen)
  }, [isValidationOpen])

  const handleTitleClick = useCallback(() => {
    if (isCollapsed) onExpand()
    if (!isCollapsed) onCollapse()
  }, [isCollapsed, onExpand, onCollapse])

  return (
    <div className={classNames(styles.root, isCollapsed && styles.isCollapsed)}>
      <div className={styles.mainNav}>
        <div className={styles.title} onClick={handleTitleClick}>
          <strong>{title}</strong>
        </div>

        <div className={styles.paneFunctions}>
          {LanguageFilter && <LanguageFilter />}
          <ValidationMenu
            isOpen={isValidationOpen}
            onClose={handleCloseValidationResults}
            onToggle={handleToggleValidationResults}
            setFocusPath={setFocusPath}
          />
        </div>

        <div className={styles.contextMenuContainer}>
          <DocumentPanelContextMenu
            isOpen={isContextMenuOpen}
            items={contextMenuItems}
            onAction={onContextMenuAction}
            onCloseMenu={handleCloseContextMenu}
            onToggleMenu={handleToggleContextMenu}
          />
        </div>
      </div>

      <div className={styles.viewNav}>
        {views.length > 1 && (
          <div className={styles.tabsContainer}>
            <DocumentHeaderTabs activeViewId={activeViewId} views={views} />
          </div>
        )}

        <div className={styles.versionSelectContainer}>
          <TimelineDropdown
            isOpen={isVersionSelectOpen}
            refNode={
              <button onClick={handleVersionsSelectClick} type="button">
                Current draft &darr;
              </button>
            }
          />
        </div>

        <div className={styles.viewActions}>
          {splitPane && views.length > 1 && (
            <button type="button" onClick={splitPane} title="Split pane right">
              <div tabIndex={-1}>
                <SplitHorizontalIcon />
              </div>
            </button>
          )}

          {splitPane && isClosable && (
            <button type="button" onClick={closePane} title="Close pane">
              <div tabIndex={-1}>
                <CloseIcon />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
