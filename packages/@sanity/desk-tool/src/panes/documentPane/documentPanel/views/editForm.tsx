/* eslint-disable @typescript-eslint/no-explicit-any */

import {useDocumentPresence} from '@sanity/base/hooks'
import schema from 'part:@sanity/base/schema'
import {FormBuilder} from 'part:@sanity/form-builder'
import documentStore from 'part:@sanity/base/datastore/document'
import React, {FormEvent, useEffect, useMemo, useRef, memo} from 'react'
import {Subscription} from 'rxjs'
import {tap} from 'rxjs/operators'
import {useDocument} from '../../utils/document'
import {useDocumentPane} from '../../use'
import {Doc} from '../../types'

const preventDefault = (ev: FormEvent) => ev.preventDefault()

interface Props {
  filterField: () => boolean
  focusPath: any[]
  onBlur: () => void
  onChange: (event: any) => void
  onFocus: (focusPath: any[]) => void
  readOnly: boolean
  value: Doc
}

export const EditForm = memo((props: Props) => {
  const {filterField, focusPath, onBlur, onFocus, onChange, readOnly, value} = props
  const doc = useDocument()
  const {markers} = useDocumentPane()
  const presence = useDocumentPresence(doc.id)
  const subscriptionRef = useRef<Subscription | null>(null)
  const patchChannel = useMemo(() => FormBuilder.createPatchChannel(), [])

  useEffect(() => {
    subscriptionRef.current = documentStore.pair
      .documentEvents(doc.id, doc.typeName)
      .pipe(
        tap((event: any) => {
          patchChannel.receiveEvent(event)
        })
      )
      .subscribe()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [])

  return (
    <form onSubmit={preventDefault}>
      <FormBuilder
        schema={schema}
        patchChannel={patchChannel}
        value={value || {_type: doc.schemaType}}
        type={doc.schemaType}
        presence={presence}
        filterField={filterField}
        readOnly={readOnly}
        onBlur={onBlur}
        onFocus={onFocus}
        focusPath={focusPath}
        onChange={onChange}
        markers={markers}
      />
    </form>
  )
})

EditForm.displayName = 'EditForm'
