/* eslint-disable @typescript-eslint/explicit-function-return-type */

import React, {useCallback, useEffect, useMemo, useState} from 'react'
// import {Subscription} from 'rxjs'
import {isActionEnabled} from 'part:@sanity/base/util/document-action-utils'
import Button from 'part:@sanity/components/buttons/default'
import afterEditorComponents from 'all:part:@sanity/desk-tool/after-editor-component'
import filterFieldFn$ from 'part:@sanity/desk-tool/filter-fields-fn?'
import {setLocation} from 'part:@sanity/base/datastore/presence'
import {PresenceOverlay} from '@sanity/base/presence'
// import {Doc} from '../../types'
import {useDocumentPane} from '../../hooks'
import {EditForm} from './editForm'

import styles from './formView.css'

interface Props {
  readOnly?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // onChange: (patches: any[]) => void
  margins: Array<number>
}

const noop = () => undefined

const INITIAL_STATE = {
  focusPath: [] as any[],
  filterField: () => true
}

export function FormView(props: Props) {
  const {margins, readOnly} = props
  const {connectionState, onChange} = useDocumentPane()
  const isConnected = connectionState === 'connected'

  const {
    displayed,
    documentId,
    initialFocusPath,
    initialValue,
    markers,
    schemaType
  } = useDocumentPane()

  const [state, setState] = useState<any>(INITIAL_STATE)

  const isReadOnly = useMemo(() => {
    const isNonExistent = !displayed || !displayed._id

    return (
      readOnly ||
      !isConnected ||
      !isActionEnabled(schemaType, 'update') ||
      (isNonExistent && !isActionEnabled(schemaType, 'create'))
    )
  }, [displayed, isConnected, readOnly, schemaType])

  const hasTypeMismatch = displayed && displayed._type && displayed._type !== schemaType.name

  const handleEditAsActualType = useCallback(() => {
    // TODO
  }, [])

  const reportFocusPath = useCallback(
    path => {
      setLocation([
        {
          type: 'document',
          documentId,
          path,
          lastActiveAt: new Date().toISOString()
        }
      ])
    },
    [documentId]
  )

  useEffect(() => {
    if (initialFocusPath) {
      setState({focusPath: initialFocusPath})
      reportFocusPath(initialFocusPath)
    }

    if (!filterFieldFn$) return undefined

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filterFieldFnSubscription = filterFieldFn$.subscribe((filterField: any) =>
      setState({filterField})
    )

    return () => {
      if (filterFieldFnSubscription) {
        filterFieldFnSubscription.unsubscribe()
      }
    }
  }, [initialFocusPath, reportFocusPath])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFocus = useCallback(
    (path: any[]) => {
      setState({focusPath: path})
      reportFocusPath(path)
    },
    [reportFocusPath]
  )

  // const scrollToFocusPath = (path: any[]) => {
  //   const pathString = path[0]
  //   const element = document.querySelector(`[data-focus-path="${pathString}"]`)

  //   if (element) {
  //     element.scrollIntoView({behavior: 'smooth', inline: 'center'})

  //     // @todo: replace this with `element.focus({preventScroll: true})`
  //     setTimeout(() => {
  //       handleFocus(path)
  //     }, 300)
  //   } else {
  //     handleFocus(path)
  //   }
  // }

  const handleBlur = useCallback(() => {
    // do nothing
  }, [])

  if (hasTypeMismatch) {
    return (
      <div className={styles.typeMisMatchMessage}>
        This document is of type <code>{displayed!._type}</code> and cannot be edited as{' '}
        <code>{schemaType.name}</code>
        <div>
          <Button onClick={handleEditAsActualType}>Edit as {displayed!._type} instead</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <PresenceOverlay margins={margins}>
        <EditForm
          id={documentId}
          value={displayed || initialValue}
          filterField={state.filterField}
          focusPath={state.focusPath}
          markers={markers}
          onBlur={handleBlur}
          onChange={isReadOnly ? noop : onChange}
          onFocus={handleFocus}
          readOnly={isReadOnly}
          type={schemaType}
        />
      </PresenceOverlay>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {afterEditorComponents.map((AfterEditorComponent: any, idx: number) => (
        <AfterEditorComponent key={String(idx)} documentId={documentId} />
      ))}
    </div>
  )
}
