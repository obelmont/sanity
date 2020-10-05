import React, {useCallback} from 'react'
import {sortBy} from 'lodash'
import {Path} from '@sanity/types'
import {ScrollMonitor} from 'part:@sanity/components/scroll'
import {useReportedValues, Reported, TrackedChange} from '../'
import {findMostSpecificTarget} from '../helpers/findMostSpecificTarget'
import {getRelativeRect} from '../helpers/getRelativeRect'
import {isChangeBar} from '../helpers/isChangeBar'
import {scrollIntoView} from '../helpers/scrollIntoView'
import {Connectors} from './svg/Connectors'
import {Connector} from './svg/types'

interface ConnectorsOverlayProps {
  rootRef: HTMLDivElement
  onSetFocus: (nextFocusPath: Path) => void
}

export const ConnectorsOverlay = React.memo(function ConnectorsOverlay(
  props: ConnectorsOverlayProps
) {
  const {rootRef, onSetFocus} = props
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const allReportedValues = useReportedValues()
  const [, forceUpdate] = React.useReducer(n => n + 1, 0)
  const byId = new Map(allReportedValues)
  const reportedChangesPanel = byId.get('changesPanel')

  const handleConnectorClick = useCallback(
    (connector: Connector) => {
      scrollIntoView(connector.field)
      scrollIntoView(connector.change)
      onSetFocus(connector.field.path)
    },
    [onSetFocus]
  )

  const handleConnectorMouseEnter = useCallback((id: string) => {
    setHoveredId(id)
  }, [])

  const handleConnectorMouseLeave = useCallback(() => {
    setHoveredId(null)
  }, [])

  if (!reportedChangesPanel) {
    return null
  }

  const changeBarsWithHover: Reported<TrackedChange>[] = []
  const changeBarsWithFocus: Reported<TrackedChange>[] = []
  for (const value of allReportedValues) {
    if (!isChangeBar(value) || !value[1].isChanged) {
      continue
    }

    const [id, reportedChangeBar] = value
    if (id === hoveredId) {
      changeBarsWithHover.push(value)
      continue
    }

    if (reportedChangeBar.hasHover) {
      changeBarsWithHover.push(value)
      continue
    }

    if (reportedChangeBar.hasFocus) {
      changeBarsWithFocus.push(value)
      continue
    }
  }

  const isHoverConnector = changeBarsWithHover.length > 0
  const changeBarsWithFocusOrHover = isHoverConnector ? changeBarsWithHover : changeBarsWithFocus

  const enabledConnectors = changeBarsWithFocusOrHover
    .map(([id]) => ({
      field: {id, ...findMostSpecificTarget('field', id, byId)},
      change: {id, ...findMostSpecificTarget('change', id, byId)}
    }))
    .filter(({field, change}) => field.element && change.element)
    .map(({field, change}) => {
      const {rect: fieldRect, bounds: fieldBounds} = getRelativeRect(field.element, rootRef)
      const {rect: changeRect, bounds: changeBounds} = getRelativeRect(change.element, rootRef)

      return {
        id: field.id,
        hovered: !field.hasFocus && (hoveredId === field.id || field.hasHover || change.hasHover),
        focused: field.hasFocus,
        revertHovered: change.hasRevertHover,
        field: {
          rect: fieldRect,
          bounds: fieldBounds,
          id: field.id,
          element: field.element,
          path: field.path,
          isChanged: field.isChanged
        },
        change: {
          rect: changeRect,
          bounds: changeBounds,
          id: change.id,
          element: change.element,
          path: change.path,
          isChanged: change.isChanged
        }
      }
    })

  const visibleConnectors = sortBy(enabledConnectors, c => -c.field.path.length).slice(0, 1)

  return (
    <ScrollMonitor onScroll={forceUpdate}>
      <Connectors
        connectors={visibleConnectors}
        onClick={handleConnectorClick}
        onMouseEnter={handleConnectorMouseEnter}
        onMouseLeave={handleConnectorMouseLeave}
      />
    </ScrollMonitor>
  )
})
