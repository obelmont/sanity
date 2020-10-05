import classNames from 'classnames'
import React, {useCallback} from 'react'
import {
  ARROW_MARGIN_X,
  ARROW_MARGIN_Y,
  ARROW_THRESHOLD,
  DEBUG,
  INTERACTIVE_STROKE_WIDTH,
  STROKE_WIDTH
} from './constants'
import {arrowPath, connectorPath} from './draw'
import {mapConnectorToLine} from './mapConnectorToLine'
import {Connector as ConnectorType} from './types'

import styles from './Connector.css'

interface ConnectorProps {
  connector: ConnectorType
  onClick: (c: ConnectorType) => void
  onMouseEnter: (id: string) => void
  onMouseLeave: () => void
}

export function Connector({connector, onClick, onMouseEnter, onMouseLeave}: ConnectorProps) {
  const {field, change} = connector

  const line = mapConnectorToLine(connector)

  // console.time("connectorPath");
  const linePathDescription = connectorPath(line)
  // console.timeEnd("connectorPath");

  const handleClick = useCallback(() => onClick(connector), [connector, onClick])

  const handleMouseEnter = useCallback(() => onMouseEnter(connector.field.id), [
    connector,
    onMouseEnter
  ])

  const handleMouseLeave = useCallback(() => onMouseLeave(), [onMouseLeave])

  // If both ends of the connector are out of bounds, then do not render
  if (line.from.outOfBounds && line.to.outOfBounds) {
    return null
  }

  const pathClassName = classNames(
    styles.path,
    connector.hovered && styles.hovered,
    connector.focused && styles.focused,
    connector.revertHovered && styles.revertHovered
  )

  const interactivePathClassName = classNames(
    styles.interactivePath,
    connector.hovered && styles.hovered,
    connector.focused && styles.focused,
    connector.revertHovered && styles.revertHovered
  )

  return (
    <>
      {DEBUG && (
        <>
          <rect
            className={styles.debugModalRect}
            x={field.rect.left}
            y={field.bounds.top}
            width={field.rect.width}
            height={field.bounds.height}
          />

          <rect
            className={styles.debugModalRect}
            x={change.bounds.left}
            y={change.bounds.top}
            width={change.bounds.width}
            height={change.bounds.height}
          />
        </>
      )}

      <path
        className={interactivePathClassName}
        d={linePathDescription}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        strokeWidth={INTERACTIVE_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        className={pathClassName}
        d={linePathDescription}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {line.from.isAbove && (
        <path
          className={pathClassName}
          d={arrowPath(
            line.from.x + ARROW_MARGIN_X,
            line.from.bounds.top - ARROW_THRESHOLD + ARROW_MARGIN_Y,
            -1
          )}
          strokeWidth={STROKE_WIDTH}
        />
      )}

      {line.from.isBelow && (
        <path
          className={pathClassName}
          d={arrowPath(
            line.from.x + ARROW_MARGIN_X,
            line.from.bounds.bottom + ARROW_THRESHOLD - ARROW_MARGIN_Y,
            1
          )}
          strokeWidth={STROKE_WIDTH}
        />
      )}

      {line.to.isAbove && (
        <path
          className={pathClassName}
          d={arrowPath(
            line.to.bounds.left + ARROW_MARGIN_X,
            line.to.bounds.top - ARROW_THRESHOLD + ARROW_MARGIN_Y,
            -1
          )}
          strokeWidth={STROKE_WIDTH}
        />
      )}

      {line.to.isBelow && (
        <path
          className={pathClassName}
          d={arrowPath(
            line.to.bounds.left + ARROW_MARGIN_X,
            line.to.bounds.bottom + ARROW_THRESHOLD - ARROW_MARGIN_Y,
            1
          )}
          strokeWidth={STROKE_WIDTH}
        />
      )}
    </>
  )
}
