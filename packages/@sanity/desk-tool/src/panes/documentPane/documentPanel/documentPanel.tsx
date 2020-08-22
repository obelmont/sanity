import classNames from 'classnames'
import Snackbar from 'part:@sanity/components/snackbar/default'
import React, {createElement, useCallback, useMemo, useRef} from 'react'
import {usePaneRouter} from '../../../contexts/PaneRouterContext'
import {useDocumentPane} from '../use'
import {useDocument} from '../utils/document'
import {DocumentOperationResults} from './documentOperationResults'
import {DocumentHeaderTitle} from './header/title'
import {DocumentPanelHeader} from './header/header'
import {getMenuItems} from './menuItems'
import {FormView} from './views'
import {DocumentStatusBar} from './statusBar'

import styles from './documentPanel.css'

interface DocumentPanelProps {
  isHistoryOpen: boolean
}

// eslint-disable-next-line complexity
export function DocumentPanel(props: DocumentPanelProps) {
  const {isHistoryOpen} = props
  const {
    connectionState,
    currentValue,
    historyDisplayed,
    isCollapsed,
    startTime,
    toggleHistory,
    toggleInspect,
    views
  } = useDocumentPane()
  const doc = useDocument()
  const paneRouter = usePaneRouter()
  const activeViewId = paneRouter.params.view || (views[0] && views[0].id)
  const formRef = useRef<any>()
  const activeView = views.find(view => view.id === activeViewId) || views[0] || {type: 'form'}

  const menuItems = useMemo(() => {
    return (
      getMenuItems({
        canShowHistoryList: true,
        isHistoryEnabled: true,
        isHistoryOpen,
        isLiveEditEnabled: doc.schemaType.liveEdit === true,
        rev: startTime ? startTime.chunk.id : null,
        value: currentValue
      }) || []
    )
  }, [isHistoryOpen, doc.schemaType, startTime, currentValue])

  const handleContextMenuAction = useCallback(
    item => {
      if (item.action === 'production-preview') {
        window.open(item.url)
        return true
      }

      if (item.action === 'inspect') {
        toggleInspect(true)
        return true
      }

      if (item.action === 'browseHistory') {
        toggleHistory('-')
        return true
      }

      return false
    },
    [toggleHistory, toggleInspect]
  )

  const setFocusPath = useCallback(
    (path: any) => {
      if (formRef.current) {
        formRef.current.handleFocus(path)
      }
    },
    [formRef.current]
  )

  return (
    <div className={classNames(styles.root, isCollapsed && styles.isCollapsed)}>
      <div className={styles.headerContainer}>
        <DocumentPanelHeader
          activeViewId={activeViewId}
          menuItems={menuItems}
          onContextMenuAction={handleContextMenuAction}
          setFocusPath={setFocusPath}
          title={<DocumentHeaderTitle />}
          views={views}
        />
      </div>

      <div className={styles.documentViewerContainer}>
        {activeView.type === 'form' && (
          <FormView
            readOnly={historyDisplayed === 'from'}
            // @todo
            // ref={formRef}
          />
        )}

        {activeView.type === 'component' &&
          createElement(activeView.component, {
            documentId: doc.id,
            options: activeView.options,
            schemaType: doc.schemaType
          })}
      </div>

      <div className={styles.footerContainer}>
        <DocumentStatusBar lastUpdated={currentValue._updatedAt} />
      </div>

      {connectionState === 'reconnecting' && (
        <Snackbar kind="warning" isPersisted title="Connection lost. Reconnecting…" />
      )}

      <DocumentOperationResults />
    </div>
  )
}
