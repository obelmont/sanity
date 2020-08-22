import schema from 'part:@sanity/base/schema'
import {getPublishedId} from 'part:@sanity/base/util/draft-utils'
import React, {createContext, useContext} from 'react'

interface DocumentContextInterface {
  id: string
  rawId: string
  schemaType: any
  typeName: string
}

export const DocumentContext = createContext<DocumentContextInterface | null>(null)

export function useDocument() {
  const ctx = useContext(DocumentContext)

  if (!ctx) throw new Error('missing document in context')

  return ctx
}

export function DocumentProvider({
  children,
  id: rawId,
  typeName
}: {
  children: React.ReactNode
  id: string
  typeName: string
}) {
  const id = getPublishedId(rawId)
  const schemaType = schema.get(typeName)

  return (
    <DocumentContext.Provider value={{id, rawId, schemaType, typeName}}>
      {children}
    </DocumentContext.Provider>
  )
}
