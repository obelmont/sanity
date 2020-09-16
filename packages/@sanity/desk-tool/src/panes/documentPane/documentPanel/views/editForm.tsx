/* eslint-disable @typescript-eslint/no-explicit-any */

import {useDocumentPresence} from '@sanity/base/hooks'
import schema from 'part:@sanity/base/schema'
import {FormBuilder} from 'part:@sanity/form-builder'
import documentStore from 'part:@sanity/base/datastore/document'
import React, {FormEvent, useEffect, useMemo, useRef, memo} from 'react'
import {Subscription} from 'rxjs'
import {tap} from 'rxjs/operators'

const preventDefault = (ev: FormEvent) => ev.preventDefault()

type Doc = any
type SchemaType = any

interface Props {
  id: string
  value: Doc

  filterField: () => boolean
  focusPath: any[]
  markers: any[]

  onBlur: () => void
  onChange: (event: any) => void
  onFocus: (focusPath: any[]) => void
  readOnly: boolean
  type: SchemaType
}

export const EditForm = memo((props: Props) => {
  const {
    filterField,
    focusPath,
    id,
    markers,
    value,
    onBlur,
    onFocus,
    onChange,
    readOnly,
    type
  } = props

  const presence = useDocumentPresence(id)
  const subscriptionRef = useRef<Subscription | null>(null)
  const patchChannel = useMemo(() => FormBuilder.createPatchChannel(), [])

  useEffect(() => {
    subscriptionRef.current = documentStore.pair
      .documentEvents(id, type.name)
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
  }, [patchChannel, id, type.name])

  return (
    <form onSubmit={preventDefault}>
      <FormBuilder
        schema={schema}
        patchChannel={patchChannel}
        value={value || {_type: type}}
        type={type}
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
