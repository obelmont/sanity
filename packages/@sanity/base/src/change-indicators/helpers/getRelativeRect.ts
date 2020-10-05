function isElementNode(el: Node): el is HTMLElement {
  return el.nodeType === Node.ELEMENT_NODE
}

function isScrollContainer(el: Node): el is HTMLElement {
  if (isElementNode(el)) {
    const overflowYStyle = getComputedStyle(el).overflowY

    return overflowYStyle === 'hidden' || overflowYStyle === 'auto' || overflowYStyle === 'scroll'
  }

  return false
}

function findScrollParent(element: HTMLElement): HTMLElement | null {
  let node: Node | null = element
  let parent: Node | null = node.parentNode

  while (parent) {
    if (isScrollContainer(parent)) {
      return parent
    }

    node = parent
    parent = node.parentNode
  }

  return null
}

export function getRelativeRect(element: HTMLElement, rootElement: HTMLElement) {
  const scrollParent = findScrollParent(element) || document.body

  const rootRect = rootElement.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  const scrollParentRect = scrollParent.getBoundingClientRect()

  return {
    rect: {
      top: elementRect.top - rootRect.top,
      right: elementRect.right - rootRect.left,
      bottom: elementRect.bottom - rootRect.top,
      left: elementRect.left - rootRect.left,
      width: elementRect.width,
      height: elementRect.height
    },
    bounds: {
      top: scrollParentRect.top - rootRect.top,
      right: scrollParentRect.right - rootRect.left,
      bottom: scrollParentRect.bottom - rootRect.top,
      left: scrollParentRect.left - rootRect.left,
      width: scrollParentRect.width,
      height: scrollParentRect.height
    }
  }
}
