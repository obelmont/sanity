const KEY_I = 73
const KEY_O = 79

export function isInspectHotkey(event: React.KeyboardEvent): boolean {
  return event.ctrlKey && event.keyCode === KEY_I && event.altKey && !event.shiftKey
}

export function isPreviewHotkey(event: React.KeyboardEvent): boolean {
  return event.ctrlKey && event.keyCode === KEY_O && event.altKey && !event.shiftKey
}
