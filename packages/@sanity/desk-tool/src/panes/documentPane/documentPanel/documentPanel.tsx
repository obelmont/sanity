import classNames from 'classnames'
import {PortalProvider, usePortal} from 'part:@sanity/components/portal'
import React, {createElement, useCallback, useRef} from 'react'
import {useDeskToolFeatures} from '../../../features'
import {useDocumentPane} from '../hooks'
import {DocumentPanelHeader} from './header/header'
import {FormView} from './views'

import styles from './documentPanel.css'
import {
  DEFAULT_MARGINS,
  MARGINS_NARROW_SCREEN_WITH_TABS,
  MARGINS_NARROW_SCREEN_WITHOUT_TABS
} from './constants'

interface DocumentPanelProps {
  onTimelineOpen: () => void
  rootElement: HTMLDivElement | null
  versionSelectRef: React.MutableRefObject<HTMLDivElement | null>
}

export function DocumentPanel(props: DocumentPanelProps) {
  const {
    activeViewId,
    displayed,
    documentId,
    draft,
    historyController,
    initialValue,
    isCollapsed,
    openHistory,
    published,
    schemaType,
    toggleInspect,
    value,
    views
  } = useDocumentPane()
  const {onTimelineOpen, rootElement, versionSelectRef} = props
  const parentPortal = usePortal()
  const features = useDeskToolFeatures()
  const portalRef = useRef<HTMLDivElement | null>(null)
  // const formRef = useRef<any>()
  const activeView = views.find(view => view.id === activeViewId) || views[0] || {type: 'form'}

  const {revTime} = historyController

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

      if (item.action === 'reviewChanges') {
        openHistory()
        return true
      }

      return false
    },
    [openHistory, toggleInspect]
  )

  const scrollToFocusPath = useCallback((path: any) => {
    // @todo
    // if (formRef.current) {
    //   formRef.current.scrollToFocusPath(path)
    // }
  }, [])

  // Use a local portal container when split panes is supported
  const portalElement: HTMLElement = features.splitPanes
    ? portalRef.current || parentPortal.element
    : parentPortal.element

  // Calculate the height of the header
  const hasTabs = views.length > 1
  const narrowScreenMargins = hasTabs
    ? MARGINS_NARROW_SCREEN_WITH_TABS
    : MARGINS_NARROW_SCREEN_WITHOUT_TABS
  const screenIsNarrow = !features.splitPanes
  const margins = screenIsNarrow ? narrowScreenMargins : DEFAULT_MARGINS

  return (
    <div className={classNames(styles.root, isCollapsed && styles.isCollapsed)}>
      <div className={styles.headerContainer}>
        <DocumentPanelHeader
          onContextMenuAction={handleContextMenuAction}
          onTimelineOpen={onTimelineOpen}
          rootElement={rootElement}
          scrollToFocusPath={scrollToFocusPath}
          versionSelectRef={versionSelectRef}
          rev={revTime}
        />
      </div>

      <PortalProvider element={portalElement}>
        <div className={styles.documentViewerContainer}>
          <div className={styles.documentScroller}>
            {activeView.type === 'form' && (
              <FormView readOnly={revTime !== null} margins={margins} />
            )}

            {activeView.type === 'component' &&
              createElement(activeView.component, {
                document: {
                  draft,
                  displayed: displayed || value || initialValue,
                  historical: displayed,
                  published
                },
                documentId,
                options: activeView.options,
                schemaType
              })}
          </div>

          <div className={styles.portal} ref={portalRef} />
        </div>
      </PortalProvider>
    </div>
  )
}
