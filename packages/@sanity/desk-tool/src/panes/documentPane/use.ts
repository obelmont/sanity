import {useContext} from 'react'
import {DocumentPaneContext} from './context'

export function useDocumentPane() {
  const documentPane = useContext(DocumentPaneContext)

  if (!documentPane) throw new Error('missing document pane in context')

  return documentPane
}
