import {Path} from '@sanity/types'

export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export interface Connector {
  hovered: boolean
  focused: boolean
  revertHovered: boolean
  field: {
    id: string
    element: HTMLElement
    path: Path
    isChanged: boolean
    bounds: Rect
    rect: Rect
  }
  change: {
    id: string
    element: HTMLElement
    path: Path
    isChanged: boolean
    bounds: Rect
    rect: Rect
  }
}

export interface ConnectorLinePoint {
  bounds: {
    top: number
    bottom: number
    left: number
    right: number
  }
  x: number
  y: number
  startY: number
  centerY: number
  endY: number
  isAbove: boolean
  isBelow: boolean
  outOfBounds: boolean
}

export interface ConnectorLine {
  from: ConnectorLinePoint
  to: ConnectorLinePoint
}
