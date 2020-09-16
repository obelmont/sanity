import React, {useCallback} from 'react'
import Tab from 'part:@sanity/components/tabs/tab'
import TabList from 'part:@sanity/components/tabs/tab-list'
import {useDocumentPane} from '../../hooks'

import styles from './tabs.css'

export function DocumentHeaderTabs() {
  const {activeViewId, idPrefix, views} = useDocumentPane()
  const tabPanelId = `${idPrefix}tabpanel`

  return (
    <div className={styles.headerTabsContainer}>
      <TabList>
        {views.map((view, index) => (
          <DocumentHeaderTab
            icon={view.icon}
            id={`${idPrefix}tab-${view.id}`}
            isActive={activeViewId === view.id}
            key={view.id}
            label={<>{view.title}</>}
            tabPanelId={tabPanelId}
            viewId={index === 0 ? null : view.id}
          />
        ))}
      </TabList>
    </div>
  )
}

function DocumentHeaderTab(props: {
  icon?: React.ComponentType<Record<string, unknown>>
  id: string
  isActive: boolean
  label: React.ReactNode
  tabPanelId: string
  viewId: string | null
}) {
  const {icon, id, isActive, label, tabPanelId, viewId} = props
  const {setActiveView} = useDocumentPane()
  const handleClick = useCallback(() => setActiveView(viewId), [setActiveView, viewId])

  return (
    <Tab
      icon={icon}
      id={id}
      isActive={isActive}
      label={label}
      onClick={handleClick}
      aria-controls={tabPanelId}
    />
  )
}
