import React, {useCallback} from 'react'
import Tab from 'part:@sanity/components/tabs/tab'
import TabList from 'part:@sanity/components/tabs/tab-list'
import {DocumentView} from '../../types'

import {useDocumentPane} from '../../use'
import styles from './tabs.css'

export function DocumentHeaderTabs(props: {activeViewId?: string; views?: DocumentView[]}) {
  const {activeViewId, views = []} = props
  const {paneKey} = useDocumentPane()
  const tabPanelId = `${paneKey}tabpanel`

  return (
    <div className={styles.headerTabsContainer}>
      <TabList>
        {views.map((view, index) => (
          <DocumentHeaderTab
            icon={view.icon}
            id={`${paneKey}tab-${view.id}`}
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
  icon?: React.ComponentType<any>
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
