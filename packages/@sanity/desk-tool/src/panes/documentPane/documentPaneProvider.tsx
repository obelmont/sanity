import {Chunk} from '@sanity/field/diff'
import {
  useConnectionState,
  useDocumentOperation,
  useEditState,
  useValidationStatus,
  useObservable
} from '@sanity/react-hooks'
import * as PathUtils from '@sanity/util/paths'
import schema from 'part:@sanity/base/schema'
import {MenuItemType, MenuItemGroupType} from 'part:@sanity/components/menus/default'
import {getPublishedId} from 'part:@sanity/base/util/draft-utils'
import client from 'part:@sanity/base/client'
import React, {useCallback, useState, useMemo} from 'react'
import {CodeBlock} from '../../components/CodeBlock'
import withInitialValue from '../../utils/withInitialValue'
import ErrorPane from '../errorPane/ErrorPane'
import {LoadingPane} from '../loadingPane'
import {usePaneRouter} from '../../contexts/PaneRouterContext'
import {useDeskToolFeatures} from '../../features'
import {DocumentPaneContext} from './documentPaneContext'
import {createObservableController} from './history/controller'
import {Timeline} from './history/timeline'
import {DocumentPane} from './documentPane'
import {Doc, DocumentPaneOptions, Patch} from './types'
import {getInitialValue} from './utils/value'

import {getMenuItems} from './documentPanel/menuItems'

declare const __DEV__: boolean

interface Props {
  title?: string
  paneKey: string
  type: unknown
  isLoading: boolean
  isSelected: boolean
  isCollapsed: boolean
  onChange: (patches: Patch[]) => void
  isClosable: boolean
  onExpand?: () => void
  onCollapse?: () => void
  menuItems: MenuItemType[]
  menuItemGroups: MenuItemGroupType[]
  views: {
    type: string
    id: string
    title: string
    options: Record<string, unknown>
    component: React.ComponentType<Record<string, unknown>>
  }[]
  initialValue?: Doc
  options: DocumentPaneOptions
}

// eslint-disable-next-line complexity
export const DocumentPaneProvider = withInitialValue((props: Props) => {
  const {
    initialValue: initialValueProp,
    isClosable,
    isCollapsed,
    isSelected,
    menuItemGroups,
    paneKey,
    options,
    views
  } = props

  const documentIdRaw = options.id
  const documentId = getPublishedId(documentIdRaw)
  const documentTypeName = options.type
  const {patch}: any = useDocumentOperation(documentIdRaw, documentTypeName)
  const editState: any = useEditState(documentIdRaw, documentTypeName)
  const {markers} = useValidationStatus(documentIdRaw, documentTypeName)
  const connectionState = useConnectionState(documentIdRaw, documentTypeName)
  const schemaType = schema.get(documentTypeName)
  const paneRouter = usePaneRouter()
  const activeViewId = paneRouter.params.view || (views[0] && views[0].id)
  const initialFocusPath = paneRouter.params.path
    ? PathUtils.fromString(paneRouter.params.path)
    : []
  const isInspectOpen = paneRouter.params.inspect === 'on'

  const onChange = React.useCallback(
    patches => {
      patch.execute(patches, initialValueProp)
    },
    [initialValueProp, patch]
  )

  const initialValue = getInitialValue({initialValue: initialValueProp, options: options})
  const value = (editState && (editState.draft || editState.published)) || initialValue

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
    [isInspectOpen, paneRouter]
  )

  const setActiveView = useCallback((id: string | null) => paneRouter.setView(id), [paneRouter])

  const closePane = useCallback(() => paneRouter.closeCurrent(), [paneRouter])

  const splitPane = useCallback(() => paneRouter.duplicateCurrent(), [paneRouter])

  const [timelineMode, setTimelineMode] = useState<'since' | 'rev' | 'closed'>('closed')

  const timeline = useMemo(
    () =>
      new Timeline({
        publishedId: documentId,
        enableTrace: __DEV__
      }),
    [documentId]
  )

  // note: this emits sync so can never be null
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const {historyController} = useObservable(
    useMemo(
      () =>
        createObservableController({
          timeline,
          documentId: documentId,
          client
        }),
      [documentId, timeline]
    )
  )!

  const {since, rev} = paneRouter.params as Record<string, string | undefined>
  historyController.setRange(since || null, rev || null)

  const closeHistory = useCallback(() => {
    paneRouter.setParams({...paneRouter.params, since: undefined})
  }, [paneRouter])

  const openHistory = useCallback(() => {
    paneRouter.setParams({...paneRouter.params, since: '@lastPublished'})
  }, [paneRouter])

  const setTimelineRange = useCallback(
    (newSince: string | null, newRev: string | null) => {
      paneRouter.setParams({
        ...paneRouter.params,
        since: newSince,
        rev: newRev ? newRev : undefined
      })
    },
    [paneRouter]
  )

  let displayed = value

  if (historyController.onOlderRevision()) {
    displayed = historyController.displayed()
  }

  const selectRev = useCallback(
    (revChunk: Chunk) => {
      const [sinceId, revId] = historyController.findRangeForNewRev(revChunk)
      setTimelineMode('closed')
      setTimelineRange(sinceId, revId)
    },
    [historyController, setTimelineRange, setTimelineMode]
  )

  const features = useDeskToolFeatures()

  const {revTime} = historyController

  const isChangesOpen = historyController.changesPanelActive()

  const menuItems = useMemo(() => {
    return (
      getMenuItems({
        features,
        isHistoryOpen: isChangesOpen,
        rev: revTime ? revTime.id : null,
        value
      }) || []
    )
  }, [features, isChangesOpen, revTime, value])

  if (connectionState === 'connecting' || !editState) {
    return <LoadingPane {...props} delay={600} title={`Loading ${schemaType.title}…`} />
  }

  if (!schemaType) {
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
            <CodeBlock>{JSON.stringify(value, null, 2)}</CodeBlock>
          </div>
        )}
      </ErrorPane>
    )
  }

  return (
    <DocumentPaneContext.Provider
      value={{
        activeViewId,
        closeHistory,
        closePane,
        connectionState,
        displayed,
        documentId,
        documentIdRaw,
        documentType: documentTypeName,
        draft: editState.draft,
        historyController,
        idPrefix: paneKey,
        initialFocusPath,
        initialValue,
        isChangesOpen,
        isClosable,
        isCollapsed,
        isInspectOpen,
        isSelected,
        markers: markers as any,
        menuItems,
        menuItemGroups,
        onChange,
        openHistory,
        published: editState.published,
        schemaType,
        selectRev,
        setActiveView,
        setTimelineMode,
        setTimelineRange,
        splitPane,
        timeline,
        timelineMode,
        toggleInspect,
        value,
        views
      }}
    >
      <DocumentPane />
    </DocumentPaneContext.Provider>
  )
})
