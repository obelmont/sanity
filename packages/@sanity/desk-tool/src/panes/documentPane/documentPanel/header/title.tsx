import * as React from 'react'
import schema from 'part:@sanity/base/schema'
import {PreviewFields} from 'part:@sanity/base/preview'
import {useDocumentPane} from '../../hooks'

export function DocumentHeaderTitle() {
  const {documentType, value} = useDocumentPane()
  const type = schema.get(documentType)

  // @todo
  // if (paneTitle) {
  //   return <span>{paneTitle}</span>
  // }

  if (!value) {
    return <>New {type.title || type.name}</>
  }

  return (
    <PreviewFields document={value} type={type} fields={['title']}>
      {({title}) => (title ? <span>{title}</span> : <em>Untitled</em>)}
    </PreviewFields>
  )
}
