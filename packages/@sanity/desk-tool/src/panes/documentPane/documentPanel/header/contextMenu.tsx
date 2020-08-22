import IconMoreVert from 'part:@sanity/base/more-vert-icon'
import Button from 'part:@sanity/components/buttons/default'
import Menu from 'part:@sanity/components/menus/default'
import React, {useMemo} from 'react'
import {Tooltip} from 'react-tippy'
import {MenuAction} from '../../types'

import {useDocumentPane} from '../../use'
import styles from './contextMenu.css'

interface DocumentPanelContextMenuProps {
  isOpen: boolean
  items: MenuAction[]
  onAction: (action: MenuAction) => void
  onCloseMenu: () => void
  onToggleMenu: () => void
}

export function DocumentPanelContextMenu(props: DocumentPanelContextMenuProps) {
  const {isOpen, items, onAction, onCloseMenu, onToggleMenu} = props
  const {isCollapsed, menuItemGroups: itemGroups} = useDocumentPane()

  const id = useMemo(
    () =>
      Math.random()
        .toString(36)
        .substr(2, 6),
    []
  )

  return (
    <Tooltip
      arrow
      distance={13}
      theme="light"
      trigger="click"
      position="bottom"
      interactive
      open={isOpen}
      onRequestClose={onCloseMenu}
      useContext
      html={
        <Menu
          id={id}
          items={items}
          groups={itemGroups}
          origin={isCollapsed ? 'top-left' : 'top-right'}
          onAction={onAction}
          onClose={onCloseMenu}
          onClickOutside={onCloseMenu}
        />
      }
    >
      <Button
        aria-label="Menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={id}
        className={styles.menuOverflowButton}
        icon={IconMoreVert}
        kind="simple"
        onClick={onToggleMenu}
        padding="small"
        selected={isOpen}
        title="Show menu"
      />
    </Tooltip>
  )
}
