import React from 'react'
import {Connector} from './Connector'
import {Connector as ConnectorType} from './types'

import styles from './Connectors.css'

interface ConnectorsProps {
  connectors: ConnectorType[]
  onClick: (connector: ConnectorType) => void
  onMouseEnter: (id: string) => void
  onMouseLeave: () => void
}

export function Connectors({connectors, onClick, onMouseEnter, onMouseLeave}: ConnectorsProps) {
  return (
    <svg className={styles.root}>
      {connectors.map(connector => (
        <Connector
          connector={connector}
          key={connector.field.id}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      ))}
    </svg>
  )
}
