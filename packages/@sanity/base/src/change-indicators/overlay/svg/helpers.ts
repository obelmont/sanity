// import {
//   ARROW_MARGIN,
//   ARROW_SIZE,
//   ARROW_THRESHOLD,
//   CORNER_RADIUS,
//   DISTANCE_FROM_EDGE,
//   DISTANCE_FROM_RIGHT
// } from './constants'
// import {ConnectorType, Line} from './types'

// export function mapConnectorToLine(connector: ConnectorType, boxHeight: number): Line {
//   const {from, to} = connector

//   const line = {
//     from: {
//       x: from.left + from.width,
//       y: from.top + from.height / 2,
//       virtualY: from.top + from.height / 2,
//       topY: from.top + DISTANCE_FROM_EDGE,
//       bottomY: from.top + from.height - DISTANCE_FROM_EDGE,
//       outOfBounds: false
//     },
//     to: {
//       x: to.left,
//       y: to.top + to.height / 2,
//       virtualY: to.top + to.height / 2,
//       topY: to.top + DISTANCE_FROM_EDGE,
//       bottomY: to.top + to.height - DISTANCE_FROM_EDGE,
//       outOfBounds: false
//     }
//   }

//   const dir = line.from.y < line.to.y ? -1 : 1

//   if (dir < 0) {
//     line.from.y = Math.min(line.from.bottomY, line.to.y)
//     line.to.y = Math.max(line.to.topY, line.from.y)
//     line.to.virtualY = Math.max(line.to.topY, line.from.y)
//   }

//   if (dir > 0) {
//     line.to.y = Math.min(line.to.bottomY, line.from.y)
//     line.from.y = Math.max(line.from.topY, line.to.y)
//     line.from.virtualY = Math.max(line.from.topY, line.to.y)
//   }

//   // check if from Y is out of bounds
//   if (
//     from.top + from.height < ARROW_THRESHOLD + DISTANCE_FROM_EDGE ||
//     from.top > boxHeight - (ARROW_THRESHOLD + DISTANCE_FROM_EDGE)
//   ) {
//     line.from.outOfBounds = true
//   }

//   // check if to Y is out of bounds
//   if (
//     to.top + to.height < ARROW_THRESHOLD + DISTANCE_FROM_EDGE ||
//     to.top > boxHeight - (ARROW_THRESHOLD + DISTANCE_FROM_EDGE)
//   ) {
//     line.to.outOfBounds = true
//   }

//   line.from.y = Math.max(Math.min(line.from.y, boxHeight - ARROW_THRESHOLD), ARROW_THRESHOLD)

//   line.to.y = Math.max(Math.min(line.to.y, boxHeight - ARROW_THRESHOLD), ARROW_THRESHOLD)

//   return line
// }

// export function arrowPath(x: number, y: number, dir: number): string {
//   return [
//     `M ${x - ARROW_SIZE} ${y - ARROW_SIZE * dir} `,
//     `L ${x} ${y}`,
//     `L ${x + ARROW_SIZE} ${y - ARROW_SIZE * dir}`
//   ].join('')
// }

// export function connectorPath(line: Line): string {
//   const dir = line.from.y < line.to.y ? -1 : 1
//   const r1 = Math.min(CORNER_RADIUS, Math.abs(line.from.y - line.to.y) / 2)

//   const left = line.from.outOfBounds
//     ? // the left side is an arrow:
//       [
//         `M ${line.from.x + DISTANCE_FROM_RIGHT} ${
//           line.from.virtualY > ARROW_THRESHOLD ? 600 - ARROW_MARGIN : ARROW_MARGIN
//         }`
//       ]
//     : // the left side is connected:
//       [
//         `M ${line.from.x} ${line.from.y}`,
//         `L ${line.from.x + DISTANCE_FROM_RIGHT - r1} ${line.from.y}`,
//         `Q ${line.from.x + DISTANCE_FROM_RIGHT} ${line.from.y}`,
//         ` ${line.from.x + DISTANCE_FROM_RIGHT} ${line.from.y - r1 * dir}`
//       ]

//   const right = line.to.outOfBounds
//     ? // the right side is an arrow:
//       [
//         `L ${line.from.x + DISTANCE_FROM_RIGHT} ${
//           line.to.virtualY > ARROW_THRESHOLD ? 600 - ARROW_MARGIN : ARROW_MARGIN
//         }`
//       ]
//     : // the right side is connected:
//       [
//         `L ${line.from.x + DISTANCE_FROM_RIGHT} ${line.to.y + r1 * dir}`,
//         `Q ${line.from.x + DISTANCE_FROM_RIGHT} ${line.to.y}`,
//         ` ${line.from.x + DISTANCE_FROM_RIGHT + r1} ${line.to.y}`,
//         `L ${line.to.x} ${line.to.y}`
//       ]

//   return left.join('') + right.join('')
// }
