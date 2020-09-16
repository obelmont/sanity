import {ComponentType} from 'react'

export interface DocumentPaneOptions {
  id: string
  type: string
  template?: string
}

export interface DocumentView {
  type: string
  id: string
  title: string
  options: Record<string, unknown>
  component: ComponentType<Record<string, unknown>>
  icon?: ComponentType<Record<string, unknown>>
}

// @todo: import from elsewhere
export interface Doc {
  _id?: string
  _type?: string
  _rev?: string
  _updatedAt?: string
  [key: string]: unknown
}

// @todo: import from elsewhere
type KeyedSegment = {_key: string}
type PathSegment = string | number | KeyedSegment
export type Path = PathSegment[]

// @todo: import from elsewhere
export interface Marker {
  path: Path
  type: string
  level?: string
  item: {message: string}
}

// @todo: import from elsewhere
export type JSONValue = number | string | boolean | {[key: string]: JSONValue} | JSONValue[]
export type Origin = 'remote' | 'local' | 'internal'
export type SetPatch = {
  path: Path
  type: 'set'
  origin?: Origin
  value: JSONValue
}
export type IncPatch = {
  path: Path
  type: 'inc'
  origin?: Origin
  value: JSONValue
}
export type DecPatch = {
  path: Path
  type: 'dec'
  origin?: Origin
  value: JSONValue
}
export type SetIfMissingPatch = {
  path: Path
  origin?: Origin
  type: 'setIfMissing'
  value: JSONValue
}
export type UnsetPatch = {
  path: Path
  origin?: Origin
  type: 'unset'
}
export type InsertPosition = 'before' | 'after'
export type InsertPatch = {
  path: Path
  origin?: Origin
  type: 'insert'
  position: InsertPosition
  items: JSONValue[]
}
export type DiffMatchPatch = {
  path: Path
  type: 'diffMatchPatch'
  origin?: Origin
  value: string
}
export type Patch = SetPatch | SetIfMissingPatch | UnsetPatch | InsertPatch | DiffMatchPatch
