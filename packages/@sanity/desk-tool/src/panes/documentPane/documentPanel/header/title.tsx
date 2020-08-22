import * as React from 'react'
import {PreviewFields} from 'part:@sanity/base/preview'
import {useDocument} from '../../utils/document'
import {useDocumentPane} from '../../use'

export function DocumentHeaderTitle() {
  const {schemaType} = useDocument()
  const {currentValue, paneTitle} = useDocumentPane()

  if (paneTitle) {
    return <span>{paneTitle}</span>
  }

  if (!currentValue) {
    return <>New {schemaType.title || schemaType.name}</>
  }

  return (
    <PreviewFields document={currentValue} type={schemaType} fields={['title']}>
      {({title}) => (title ? <span>{title}</span> : <em>Untitled</em>)}
    </PreviewFields>
  )
}

DocumentHeaderTitle.defaultProps = {paneTitle: undefined}
