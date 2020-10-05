import {ARROW_MARGIN_Y, ARROW_THRESHOLD, CONNECTOR_MARGIN} from './constants'
import {Connector as ConnectorType, ConnectorLinePoint, Rect} from './types'

function getConnectorLinePoint(rect: Rect, bounds: Rect): ConnectorLinePoint {
  const centerY = rect.top + rect.height / 2
  const isAbove = rect.bottom < bounds.top + ARROW_MARGIN_Y
  const isBelow = rect.top > bounds.bottom - ARROW_MARGIN_Y

  return {
    bounds: bounds,
    x: rect.left,
    y: centerY,
    centerY,
    startY: rect.top + CONNECTOR_MARGIN,
    endY: rect.bottom - CONNECTOR_MARGIN,
    isAbove,
    isBelow,
    outOfBounds: isAbove || isBelow
  }
}

export function mapConnectorToLine(connector: ConnectorType) {
  const {field, change} = connector

  const fromBounds = {
    top: field.bounds.top + ARROW_THRESHOLD,
    bottom: field.bounds.bottom - ARROW_THRESHOLD,
    left: field.bounds.left,
    right: field.bounds.right,
    width: field.bounds.width,
    height: field.bounds.height
  }

  const from = getConnectorLinePoint(field.rect, fromBounds)
  from.x = field.rect.right

  const toBounds = {
    top: change.bounds.top + ARROW_THRESHOLD,
    bottom: change.bounds.bottom - ARROW_THRESHOLD,
    left: change.bounds.left,
    right: change.bounds.right,
    width: change.bounds.width,
    height: change.bounds.height
  }

  const to = getConnectorLinePoint(change.rect, toBounds)

  const maxStartY = Math.max(to.startY, from.startY)

  // Align from <-> to vertically
  from.y = Math.min(maxStartY, from.endY)
  if (from.y < toBounds.top) {
    from.y = Math.min(toBounds.top, from.endY)
  } else if (from.y > toBounds.bottom) {
    from.y = Math.max(toBounds.bottom, from.startY)
  }
  to.y = Math.min(maxStartY, to.endY)
  if (to.y < fromBounds.top) {
    to.y = Math.min(fromBounds.top, to.endY)
  } else if (to.y > fromBounds.bottom) {
    to.y = Math.max(fromBounds.bottom, to.startY)
  }

  // Keep within bounds
  from.y = Math.min(Math.max(from.y, fromBounds.top), fromBounds.bottom)
  to.y = Math.min(Math.max(to.y, toBounds.top), toBounds.bottom)

  return {from, to}
}
