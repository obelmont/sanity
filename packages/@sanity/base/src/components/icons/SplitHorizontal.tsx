// part:@sanity/base/split-horizontal-icon

import React from 'react'

const strokeStyle = {
  stroke: 'currentColor',
  strokeWidth: 1.2,
}

const HSplitIcon = () => (
  <svg
    data-sanity-icon
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    width="1em"
    height="1em"
  >
    <rect x="5.5" y="5.5" width="14" height="14" style={strokeStyle} />
    <path d="M12.5 5.5V19.5" style={strokeStyle} />
  </svg>
)

export default HSplitIcon
