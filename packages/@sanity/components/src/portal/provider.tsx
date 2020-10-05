import React from 'react'
import {PortalContext} from './context'
import {defaultContextValue} from './defaultContextValue'

interface PortalProviderProps {
  children: React.ReactNode
  element: HTMLElement | null
}

export function PortalProvider(props: PortalProviderProps) {
  return (
    <PortalContext.Provider value={{element: props.element || defaultContextValue.element}}>
      {props.children}
    </PortalContext.Provider>
  )
}
