import {createContext} from 'react'
import {Doc, DocumentMarker, DocumentView, MenuItemGroup} from './types'
import {Controller, Timeline, TimeRef} from './history'

export interface DocumentPane {
  closeHistory: () => void
  closePane: () => void
  connectionState: 'connecting' | 'connected' | 'reconnecting'
  currentValue: Doc
  displayedValue: Doc | null
  historyController: Controller | null
  historyDisplayed: 'from' | 'to'
  initialFocusPath: any[]
  initialValue: Doc
  isClosable: boolean
  isCollapsed: boolean
  isInspectOpen: boolean
  markers: DocumentMarker[]
  menuItemGroups: MenuItemGroup[]
  paneKey: string
  paneTitle?: string
  onCollapse: () => void
  onExpand: () => void
  setActiveView: (viewId: string | null) => void
  splitPane: () => void
  startTime: TimeRef | null
  timeline: Timeline | null
  toggleHistory: (startTimeId: string | null) => void
  toggleInspect: (val?: boolean) => void
  views: DocumentView[]
}

export const DocumentPaneContext = createContext<DocumentPane | null>(null)
