import {ComponentType} from 'react'

export interface DocumentPaneOptions {
  id: string
  type: string
  template?: string
}

export interface DocumentValidationMarker {
  type: 'validation'
  level: 'error' | 'warning'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  path: any[]
}

export type DocumentMarker = DocumentValidationMarker

export interface DocumentView {
  type: string
  id: string
  title: string
  options: {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: ComponentType<any>
}

export interface Doc {
  _id?: string
  _type?: string
  _rev?: string
  _updatedAt?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface MenuAction {
  action: string
  icon?: React.FunctionComponent | React.Component
  isDisabled?: boolean
  title: React.ReactNode
  url?: string
}

export interface MenuItemGroup {
  id: string
}

export interface DocumentViewType {
  type: string
  id: string
  title: string
  options: {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>
}

export interface ObjectSchemaType {
  name: string
  jsonType: string
  title?: string
  fields: ObjectField[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  diffComponent?: ComponentType<any>
}

export interface ObjectField {
  name: string
  type: SchemaType
}

export type SchemaType = ObjectSchemaType
