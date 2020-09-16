import {Chunk, ObjectSchemaType} from '@sanity/field/diff'
import {MenuItemType, MenuItemGroupType} from 'part:@sanity/components/menus/default'
import {createContext} from 'react'
import {Controller} from './documentHistory/history/controller'
import {Timeline} from './documentHistory/history/timeline'
import {Doc, DocumentView, Marker, Patch, Path} from './types'

export interface IDocumentPaneContext {
  activeViewId: string
  closeHistory(): void
  closePane: () => void
  connectionState: 'connecting' | 'connected' | 'reconnecting'
  displayed: Doc | null
  documentId: string
  documentIdRaw: string
  documentType: string
  draft: Doc | null
  historyController: Controller
  idPrefix: string
  initialFocusPath: Path
  initialValue: Doc
  isChangesOpen: boolean
  isClosable: boolean
  isCollapsed: boolean
  isInspectOpen: boolean
  isSelected: boolean
  markers: Marker[]
  menuItems: MenuItemType[]
  menuItemGroups: MenuItemGroupType[]
  onChange: (patches: Patch[]) => void
  onExpand?: () => void
  onCollapse?: () => void
  openHistory(): void
  published: Doc | null
  schemaType: ObjectSchemaType
  selectRev: (revChunk: Chunk) => void
  setActiveView: (viewId: string | null) => void
  setTimelineMode: (mode: 'since' | 'rev' | 'closed') => void
  setTimelineRange(since: string | null, rev: string | null): void
  splitPane: () => void
  timeline: Timeline
  timelineMode: 'since' | 'rev' | 'closed'
  toggleInspect: (val?: boolean) => void
  title?: string
  views: DocumentView[]
  value: Doc | null
}

export const DocumentPaneContext = createContext<IDocumentPaneContext | null>(null)
