import React, {useCallback} from 'react'
import {combineLatest, Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import JSONInspector from 'react-json-inspector'
import FullScreenDialog from 'part:@sanity/components/dialogs/fullscreen'
import TabList from 'part:@sanity/components/tabs/tab-list'
import Tab from 'part:@sanity/components/tabs/tab'
import TabPanel from 'part:@sanity/components/tabs/tab-panel'
import {isObject} from 'lodash'
import HLRU from 'hashlru'
import {withPropsStream} from 'react-props-stream'
import settings from '../../../settings'
import DocTitle from '../../../components/DocTitle'
import {Doc} from '../types'
import {useDocumentPane} from '../use'

import styles from './inspectDialog.css'

const lru = HLRU(1000)

function isExpanded(keyPath: any, value: any) {
  const cached = lru.get(keyPath)
  if (cached === undefined) {
    lru.set(keyPath, Array.isArray(value) || isObject(value))
    return isExpanded(keyPath, value)
  }
  return cached
}

function toggleExpanded(event: any) {
  const {path} = event
  const current = lru.get(path)
  if (current === undefined) {
    // something is wrong
    return
  }
  lru.set(path, !current)
}

function selectElement(element: HTMLElement) {
  const sel = window.getSelection()

  if (sel) {
    const range = document.createRange()

    sel.removeAllRanges()
    range.selectNodeContents(element)
    sel.addRange(range)
  }
}

function select(event: any) {
  selectElement(event.currentTarget)
}

function maybeSelectAll(event: any) {
  const selectAll = event.keyCode === 65 && (event.metaKey || event.ctrlKey)
  if (!selectAll) {
    return
  }
  event.preventDefault()
  selectElement(event.currentTarget)
}

const VIEW_MODE_PARSED = {id: 'parsed', title: 'Parsed'}
const VIEW_MODE_RAW = {id: 'raw', title: 'JSON'}
const VIEW_MODES = [VIEW_MODE_PARSED, VIEW_MODE_RAW]

const viewModeSettings = settings.forKey('inspect-view-preferred-view-mode')

interface Props {
  idPrefix: string
  onViewModeChange: any
  value: any
  viewMode: any
}

function InspectDialogComponent(props: Props) {
  const {idPrefix, onViewModeChange, value, viewMode} = props
  const {toggleInspect} = useDocumentPane()
  // @todo: prefix with pane id
  const tabIdPrefix = `${idPrefix}_inspect_`

  const handleClose = useCallback(() => toggleInspect(false), [toggleInspect])

  return (
    <FullScreenDialog
      showHeader
      title={
        <span>
          Inspecting{' '}
          <em>
            <DocTitle document={value} />
          </em>
        </span>
      }
      onClose={handleClose}
    >
      <div>
        <div className={styles.toolbar}>
          <TabList>
            <Tab
              aria-controls={`${tabIdPrefix}tabpanel`}
              id={`${tabIdPrefix}tab-${VIEW_MODE_PARSED.id}`}
              isActive={viewMode === VIEW_MODE_PARSED}
              label="Parsed"
              // eslint-disable-next-line react/jsx-no-bind
              onClick={() => onViewModeChange(VIEW_MODE_PARSED)}
            />
            <Tab
              aria-controls={`${tabIdPrefix}tabpanel`}
              id={`${tabIdPrefix}tab-${VIEW_MODE_PARSED.id}`}
              isActive={viewMode === VIEW_MODE_RAW}
              label="Raw JSON"
              // eslint-disable-next-line react/jsx-no-bind
              onClick={() => onViewModeChange(VIEW_MODE_RAW)}
            />
          </TabList>
        </div>

        <TabPanel
          aria-labelledby={`${tabIdPrefix}tab-${viewMode.id}`}
          className={styles.content}
          id={`${tabIdPrefix}tabpanel`}
          role="tabpanel"
        >
          {viewMode === VIEW_MODE_PARSED && (
            <div className={styles.jsonInspectorContainer}>
              <JSONInspector isExpanded={isExpanded} onClick={toggleExpanded} data={value} />
            </div>
          )}
          {viewMode === VIEW_MODE_RAW && (
            <pre
              className={styles.raw}
              tabIndex={0}
              onKeyDown={maybeSelectAll}
              onDoubleClick={select}
              onFocus={select}
            >
              {JSON.stringify(value, null, 2)}
            </pre>
          )}
        </TabPanel>
      </div>
    </FullScreenDialog>
  )
}

export const InspectDialog = withPropsStream<{value: Doc}, Props>(
  mapReceivedPropsToChildProps,
  InspectDialogComponent
)

function mapReceivedPropsToChildProps(props$: Observable<any>) {
  const onViewModeChange = (nextViewMode: any) => viewModeSettings.set(nextViewMode.id)

  const viewModeSetting$ = viewModeSettings
    .listen('parsed')
    .pipe(map((id: any) => VIEW_MODES.find(mode => mode.id === id)))

  return combineLatest(props$, viewModeSetting$).pipe(
    map(([props, viewMode]) => ({...props, viewMode, onViewModeChange}))
  )
}
