import {
  useConnectionState,
  useEditState,
  useValidationStatus
  // useObservable
} from '@sanity/react-hooks'
import * as PathUtils from '@sanity/util/paths'
import classNames from 'classnames'
import client from 'part:@sanity/base/client'
import schema from 'part:@sanity/base/schema'
import {getPublishedId} from 'part:@sanity/base/util/draft-utils'
import React, {useCallback, useEffect, useMemo} from 'react'
import {of} from 'rxjs'
import {usePaneRouter} from '../../contexts/PaneRouterContext'
import withInitialValue from '../../utils/withInitialValue'
import ErrorPane from '../errorPane/ErrorPane'
import {LoadingPane} from '../loadingPane'
import {ChangesPanel} from './changesPanel'
import {DocumentPaneContext} from './context'
import {DocumentPanel, getProductionPreviewItem} from './documentPanel'
import {createObservableController, Controller, Timeline} from './history'
import {InspectDialog} from './inspectDialog'
import {DocumentActionShortcuts, isInspectHotkey, isPreviewHotkey} from './keyboardShortcuts'
import {Doc, DocumentPaneOptions, DocumentView, MenuItemGroup} from './types'
import {DocumentProvider} from './utils/document'
import {getInitialValue} from './utils/value'
import {useObservable} from './utils/useObservable'

import styles from './documentPane.css'

declare const __DEV__: boolean

const noop = () => undefined

interface Props {
  initialValue?: Doc
  isCollapsed: boolean
  isClosable: boolean
  // @todo: find out if `isLoading` should be used for anything ...
  // isLoading: boolean
  isSelected: boolean
  // @todo: find out if `menuItems` should be used for anything ...
  // menuItems: MenuAction[]
  menuItemGroups: MenuItemGroup[]
  onExpand?: () => void
  onCollapse?: () => void
  options: DocumentPaneOptions
  paneKey: string
  title?: string
  views: DocumentView[]
}

// eslint-disable-next-line complexity
export const DocumentPane = withInitialValue((props: Props) => {
  const {
    initialValue: initialValueProp,
    isClosable,
    isCollapsed,
    isSelected,
    menuItemGroups,
    paneKey,
    onCollapse,
    onExpand,
    options,
    title: paneTitle,
    views
  } = props
  const documentIdRaw = options.id
  const documentTypeName = options.type
  const documentId = getPublishedId(options.id)
  const editState: {draft: Doc | null; published: Doc | null} | null = useEditState(
    documentIdRaw,
    documentTypeName
  ) as any
  const {markers} = useValidationStatus(documentIdRaw, documentTypeName)
  const connectionState = useConnectionState(documentIdRaw, documentTypeName)
  const paneRouter = usePaneRouter()
  const [showValidationTooltip, setShowValidationTooltip] = React.useState<boolean>(false)
  const schemaType = schema.get(documentTypeName)
  const isHistoryOpen = Boolean(paneRouter.params.startTime)
  const isInspectOpen = paneRouter.params.inspect === 'on'
  const initialValue = getInitialValue({initialValue: initialValueProp, options: options})
  const currentValue = (editState && (editState.draft || editState.published)) || initialValue

  const handleKeyUp = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && showValidationTooltip) {
      setShowValidationTooltip(false)
    }

    if (isInspectHotkey(event)) {
      toggleInspect()
    }

    if (isPreviewHotkey(event)) {
      const item = getProductionPreviewItem({
        value: currentValue,
        rev: null
      })

      if (item && item.url) {
        window.open(item.url)
      }
    }
  }, [])

  const toggleInspect = useCallback(
    (toggle = !isInspectOpen) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {inspect: oldInspect, ...params} = paneRouter.params
      if (toggle) {
        paneRouter.setParams({inspect: 'on', ...params})
      } else {
        paneRouter.setParams(params)
      }
    },
    [paneRouter]
  )

  const setActiveView = useCallback((id: string | null) => paneRouter.setView(id as any), [
    paneRouter
  ])

  const closePane = useCallback(() => paneRouter.closeCurrent(), [paneRouter])

  const splitPane = useCallback(() => {
    paneRouter.duplicateCurrent()
  }, [paneRouter])

  const isLoaded = Boolean(editState && (editState.draft || editState.published))

  const historyTimeline = useMemo(
    () =>
      isLoaded
        ? new Timeline({
            publishedId: documentId,
            draft: editState && editState.draft,
            published: editState && editState.published,
            enableTrace: __DEV__
          })
        : null,
    [isLoaded]
  )

  const historyController$ = useMemo(() => {
    return historyTimeline
      ? createObservableController({timeline: historyTimeline, documentId, client})
      : of(null)
  }, [Boolean(historyTimeline)])

  const historyController: Controller | null = useObservable(historyController$)

  const historyDisplayed: 'from' | 'to' =
    paneRouter.params.historyDisplayed === 'from' ? 'from' : 'to'

  const startTime = useMemo(() => {
    if (paneRouter.params.startTime) {
      return historyTimeline && historyTimeline.parseTimeId(paneRouter.params.startTime)
    }

    return null
  }, [paneRouter.params.startTime, historyController && historyController.version])

  let displayedValue = currentValue

  if (historyTimeline && startTime) {
    displayedValue =
      historyDisplayed === 'from'
        ? historyTimeline.startAttributes()
        : historyTimeline.endAttributes()
  }

  console.log('history', {
    displayedValue,
    historyDisplayed,
    historyTimeline,
    historyController,
    startTime
  })

  useEffect(() => {
    if (historyTimeline && startTime) {
      historyTimeline.setRange(startTime, null)
    }
  }, [historyTimeline, startTime])

  useEffect(() => {
    // TODO: Fetch only when open
    // if (isHistoryOpen) {
    if (historyController) {
      historyController.update({
        fetchAtLeast: 5
      })
    }
    // }
  })

  const toggleHistory = useCallback(
    (newStartTime: string | null = startTime ? null : '-') => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {startTime: oldStartTime, ...params} = paneRouter.params
      if (newStartTime) {
        paneRouter.setParams({startTime: newStartTime, ...params})
      } else {
        paneRouter.setParams(params)
      }
    },
    [paneRouter]
  )

  const closeHistory = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {startTime: oldStartTime, ...params} = paneRouter.params
    paneRouter.setParams(params)
  }, [paneRouter])

  if (!schemaType) {
    const value = editState && (editState.draft || editState.published)

    return (
      <ErrorPane
        {...props}
        color="warning"
        title={
          <>
            Unknown document type: <code>{documentTypeName}</code>
          </>
        }
      >
        {documentTypeName && (
          <p>
            This document has the schema type <code>{documentTypeName}</code>, which is not defined
            as a type in the local content studio schema.
          </p>
        )}
        {!documentTypeName && (
          <p>This document does not exist, and no schema type was specified for it.</p>
        )}
        {__DEV__ && value && (
          <div>
            <h4>Here is the JSON representation of the document:</h4>
            <pre>
              <code>{JSON.stringify(value, null, 2)}</code>
            </pre>
          </div>
        )}
      </ErrorPane>
    )
  }

  if (connectionState === 'connecting' || !editState) {
    return <LoadingPane {...props} delay={600} message={`Loading ${schemaType.title}…`} />
  }

  const ctx = {
    closeHistory,
    closePane,
    connectionState,
    currentValue,
    displayedValue,
    historyDisplayed,
    historyController,
    initialFocusPath: paneRouter.params.path ? PathUtils.fromString(paneRouter.params.path) : [],
    initialValue,
    isClosable,
    isCollapsed,
    isInspectOpen,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    markers: markers as any,
    menuItemGroups,
    paneKey,
    paneTitle,
    onCollapse: onCollapse || noop,
    onExpand: onExpand || noop,
    setActiveView,
    splitPane,
    startTime,
    timeline: historyTimeline,
    toggleHistory,
    toggleInspect,
    views
  }

  return (
    <DocumentProvider id={options.id} typeName={options.type}>
      <DocumentPaneContext.Provider value={ctx}>
        <DocumentActionShortcuts
          onKeyUp={handleKeyUp}
          className={classNames([
            styles.root,
            isCollapsed && styles.isCollapsed,
            isSelected ? styles.isActive : styles.isDisabled
          ])}
        >
          <div className={styles.documentContainer}>
            <DocumentPanel isHistoryOpen={isHistoryOpen} />
          </div>

          {!isCollapsed && isHistoryOpen && (
            <div className={styles.changesContainer}>
              <ChangesPanel />
            </div>
          )}

          {isInspectOpen && <InspectDialog value={currentValue} />}
        </DocumentActionShortcuts>
      </DocumentPaneContext.Provider>
    </DocumentProvider>
  )
})

DocumentPane.displayName = 'DocumentPane'
