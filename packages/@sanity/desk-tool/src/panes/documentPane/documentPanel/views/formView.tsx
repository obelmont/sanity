import {PresenceOverlay} from '@sanity/base/presence'
import {useDocumentOperation} from '@sanity/react-hooks'
import afterEditorComponents from 'all:part:@sanity/desk-tool/after-editor-component'
import {setLocation} from 'part:@sanity/base/datastore/presence'
import {isActionEnabled} from 'part:@sanity/base/util/document-action-utils'
import Button from 'part:@sanity/components/buttons/default'
import filterFieldFn$ from 'part:@sanity/desk-tool/filter-fields-fn?'
import React, {useCallback, useEffect, useState} from 'react'
import {Subscription} from 'rxjs'
import {useDocumentPane} from '../../use'
import {useDocument} from '../../utils/document'
import {EditForm} from './editForm'

import styles from './formView.css'

interface Props {
  readOnly?: boolean
}

const noop = () => undefined

// eslint-disable-next-line complexity
export function FormView(props: Props) {
  const {readOnly} = props
  const doc = useDocument()
  const {connectionState, displayedValue, initialFocusPath, initialValue} = useDocumentPane()
  const ops: any = useDocumentOperation(doc.id, doc.typeName)
  const patch = ops && ops.patch
  const onFieldChange = useCallback(patches => patch.execute(patches, initialValue), [patch])
  const [focusPath, setFocusPath] = useState<any[]>([])
  const [filterField, setFilterField] = useState<any>({fn: () => true})
  const isConnected = connectionState === 'connected'
  const isNonExistent = !displayedValue || !displayedValue._id
  const isReadOnly =
    !ops ||
    readOnly ||
    !isConnected ||
    !isActionEnabled(doc.schemaType, 'update') ||
    (isNonExistent && !isActionEnabled(doc.schemaType, 'create'))
  const documentId =
    displayedValue && displayedValue._id && displayedValue._id.replace(/^drafts\./, '')
  const hasTypeMismatch =
    displayedValue && displayedValue._type && displayedValue._type !== doc.schemaType.name

  const reportFocusPath = useCallback(
    path => {
      setLocation([
        {
          type: 'document',
          documentId: doc.id,
          path,
          lastActiveAt: new Date().toISOString()
        }
      ])
    },
    [doc.id]
  )

  const handleBlur = useCallback(() => {
    // do nothing
  }, [])

  const handleEditAsActualType = useCallback(() => {
    // TODO
  }, [])

  useEffect(() => {
    if (initialFocusPath) {
      setFocusPath(initialFocusPath)
      reportFocusPath(initialFocusPath)
    }

    let filterFieldFnSubscription: Subscription | null = null

    if (filterFieldFn$) {
      filterFieldFnSubscription = filterFieldFn$.subscribe(fn => setFilterField({fn}))
    }

    return () => {
      if (filterFieldFnSubscription) {
        filterFieldFnSubscription.unsubscribe()
      }
    }
  }, [])

  if (hasTypeMismatch) {
    return (
      <div className={styles.typeMisMatchMessage}>
        This document is of type <code>{displayedValue!._type}</code> and cannot be edited as{' '}
        <code>{doc.schemaType.name}</code>
        <div>
          <Button onClick={handleEditAsActualType}>Edit as {displayedValue!._type} instead</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <PresenceOverlay>
        <EditForm
          value={displayedValue || initialValue}
          filterField={filterField.fn}
          focusPath={focusPath}
          onBlur={handleBlur}
          onChange={readOnly ? noop : onFieldChange}
          onFocus={setFocusPath}
          readOnly={isReadOnly}
        />
      </PresenceOverlay>

      {afterEditorComponents.map((AfterEditorComponent: any, idx: number) => (
        <AfterEditorComponent key={String(idx)} documentId={documentId} />
      ))}
    </div>
  )
}
