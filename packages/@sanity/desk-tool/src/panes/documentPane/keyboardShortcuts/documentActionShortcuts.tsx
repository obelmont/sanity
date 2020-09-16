import React from 'react'
import {RenderActionCollectionState} from 'part:@sanity/base/actions/utils'
import {useEditState} from '@sanity/react-hooks'
import resolveDocumentActions from 'part:@sanity/base/document-actions/resolver'
import isHotkey from 'is-hotkey'
import {ActionStateDialog} from '../statusBar'
import {useDocumentPane} from '../hooks'

interface ResponderProps extends React.ComponentProps<'div'> {
  states: any[]
  activeIndex: number
  onActionStart: (index: number) => void
  rootRef: React.MutableRefObject<HTMLDivElement | null>
}

function KeyboardShortcutResponder({
  states,
  children,
  onKeyDown,
  activeIndex,
  onActionStart,
  rootRef,
  ...rest
}: ResponderProps) {
  const active = states[activeIndex]

  const handleKeyDown = React.useCallback(
    event => {
      const matchingStates = states.filter(
        state => state.shortcut && isHotkey(state.shortcut, event)
      )
      const matchingState = matchingStates[0]
      if (matchingState) {
        event.preventDefault()
      }
      if (matchingStates.length > 1) {
        // eslint-disable-next-line no-console
        console.warn(
          `Keyboard shortcut conflict: More than one document action matches the shortcut "${matchingState.shortcut}"`
        )
      }
      if (matchingState && !matchingState.disabled) {
        matchingState.onHandle()
        onActionStart(states.indexOf(matchingState))
      }
      if (onKeyDown) {
        onKeyDown(event)
      }
    },
    [onActionStart, onKeyDown, states]
  )
  return (
    <div onKeyDown={handleKeyDown} tabIndex={-1} {...rest} ref={rootRef}>
      {children}
      {active && active.dialog && <ActionStateDialog dialog={active.dialog} />}
    </div>
  )
}

interface Props extends React.ComponentProps<'div'> {
  rootRef: React.MutableRefObject<HTMLDivElement | null>
}

export const DocumentActionShortcuts = React.memo((props: Props) => {
  const {children, ...rest} = props
  const {documentId, documentType} = useDocumentPane()
  const editState = useEditState(documentId, documentType)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const onActionStart = React.useCallback(idx => {
    setActiveIndex(idx)
  }, [])

  const actions = editState ? resolveDocumentActions(editState) : null

  return actions ? (
    <RenderActionCollectionState
      actions={actions}
      actionProps={editState}
      component={KeyboardShortcutResponder}
      onActionStart={onActionStart}
      activeIndex={activeIndex}
      {...rest}
    >
      {children}
    </RenderActionCollectionState>
  ) : null
})

DocumentActionShortcuts.displayName = 'DocumentActionShortcuts'
