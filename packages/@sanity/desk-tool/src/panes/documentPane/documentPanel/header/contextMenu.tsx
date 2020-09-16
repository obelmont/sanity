import {negate} from 'lodash'
import IconMoreVert from 'part:@sanity/base/more-vert-icon'
import {MenuButton} from 'part:@sanity/components/menu-button'
import Menu, {MenuItemType} from 'part:@sanity/components/menus/default'
import React, {useCallback, useMemo} from 'react'
import {useDocumentPane} from '../../hooks'

import styles from './contextMenu.css'

interface DocumentPanelContextMenuProps {
  boundaryElement: HTMLDivElement | null
  onAction: (action: MenuItemType) => void
  open: boolean
  setOpen: (val: boolean) => void
}

const isActionButton = (item: MenuItemType) => (item as any).showAsAction
const isMenuButton = negate(isActionButton)

export function DocumentPanelContextMenu(props: DocumentPanelContextMenuProps) {
  const {boundaryElement, open, onAction, setOpen} = props
  const {menuItems, menuItemGroups} = useDocumentPane()
  const items = menuItems.filter(isMenuButton)

  const id = useMemo(
    () =>
      Math.random()
        .toString(36)
        .substr(2, 6),
    []
  )

  const handleAction = useCallback(
    (action: MenuItemType) => {
      onAction(action)
      setOpen(false)
    },
    [onAction, setOpen]
  )

  const handleCloseMenu = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <MenuButton
      boundaryElement={boundaryElement || undefined}
      buttonProps={{
        'aria-label': 'Menu',
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': id,
        className: styles.menuOverflowButton,
        icon: IconMoreVert,
        kind: 'simple',
        padding: 'small',
        selected: open,
        title: 'Show menu'
      }}
      menu={
        <Menu
          id={id}
          items={items}
          groups={menuItemGroups}
          onAction={handleAction}
          onClose={handleCloseMenu}
        />
      }
      open={open}
      placement="bottom"
      setOpen={setOpen}
    />
  )
}
