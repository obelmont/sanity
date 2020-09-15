import {startCase} from 'lodash'
import {
  diff_match_patch as DiffMatchPatch,
  DIFF_DELETE,
  DIFF_EQUAL,
  DIFF_INSERT
} from 'diff-match-patch'
import {
  StringDiffSegment,
  StringDiff as StringDiffDiff,
  StringInput,
  DiffOptions
} from '@sanity/diff'
import {ArrayDiff, ObjectDiff, StringDiff} from '../../../diff'
import {SchemaType, ObjectSchemaType} from '../../../types'
import {
  ChildMap,
  PortableTextBlock,
  PortableTextDiff,
  PortableTextChild,
  SpanTypeSchema
} from './types'

const dmp = new DiffMatchPatch()

export const UNKNOWN_TYPE_NAME = '_UNKOWN_TYPE_'

export function isPTSchemaType(schemaType: SchemaType): boolean {
  return schemaType.jsonType === 'object' && schemaType.name === 'block'
}
export function isHeader(node: PortableTextBlock): boolean {
  return !!node.style && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.style)
}

export function createChildMap(
  blockDiff: PortableTextDiff,
  schemaType: ObjectSchemaType
): ChildMap {
  // Create a map from span to diff
  const block = blockDiff.displayValue
  // Add removed children
  const childMap: ChildMap = {}
  const children = block.children || []
  // eslint-disable-next-line complexity
  children.forEach(child => {
    const summary: string[] = []
    // Fallback type for renderer (unkown types)
    if (typeof child !== 'object' || typeof child._type !== 'string') {
      child._type = UNKNOWN_TYPE_NAME
    }
    const cSchemaType = getChildSchemaType(schemaType.fields, child)
    const cDiff = findChildDiff(blockDiff, child)

    if (cDiff) {
      const textDiff = cDiff.fields.text as StringDiff
      if (textDiff && textDiff.isChanged) {
        // eslint-disable-next-line max-depth
        if (textDiff.action === 'changed') {
          summary.push(`Changed '${textDiff.fromValue}' to  '${textDiff.toValue}'`)
        } else {
          const text = textDiff.toValue || textDiff.fromValue
          summary.push(
            `${startCase(textDiff.action)}${text ? '' : ' (empty) '} text ${
              text ? `'${text}'` : ''
            }`
          )
        }
      }
      if (isAddMark(cDiff, cSchemaType)) {
        const marks = cDiff.fields.marks.toValue
        summary.push(`Added mark ${(Array.isArray(marks) ? marks : []).join(', ')}`)
      }
      if (isAddAnnotation(cDiff, cSchemaType) || isRemoveAnnotation(cDiff, cSchemaType)) {
        const mark =
          (Array.isArray(cDiff.fields.marks.toValue) && cDiff.fields.marks.toValue[0]) || ''
        const type = (block.markDefs || []).find(def => def._key === mark)
        summary.push(`Added annotation to text '${child.text}' (${type ? type._type : 'unknown'})`)
      }
      if (isAddInlineObject(cDiff) || isChangeInlineObject(cDiff) || isRemoveInlineObject(cDiff)) {
        summary.push(`${startCase(cDiff.action)} inline object`)
      }
    }
    if (cDiff && summary.length === 0) {
      summary.push(`Unkown diff ${JSON.stringify(cDiff)}`)
    }

    childMap[child._key] = {
      diff: cDiff,
      child,
      schemaType: cSchemaType,
      summary
    }
  })
  return childMap
}

export function findChildDiff(diff: ObjectDiff, child: PortableTextChild): ObjectDiff {
  const childrenDiff = diff.fields.children as ArrayDiff
  return childrenDiff.items
    .filter(
      item => item.diff.isChanged && (item.diff.toValue === child || item.diff.fromValue === child)
    )
    .map(item => item.diff)
    .map(childDiff => childDiff as ObjectDiff)[0]
}

function isAddInlineObject(cDiff: ObjectDiff) {
  return (
    cDiff.type === 'object' &&
    cDiff.isChanged &&
    cDiff.action === 'added' &&
    cDiff.fromValue === undefined &&
    !childIsSpan(cDiff.toValue as PortableTextChild)
  )
}

function isChangeInlineObject(cDiff: ObjectDiff) {
  return (
    cDiff.type === 'object' &&
    cDiff.isChanged &&
    cDiff.action === 'changed' &&
    cDiff.fromValue !== undefined &&
    !childIsSpan(cDiff.toValue as PortableTextChild)
  )
}

function isRemoveInlineObject(cDiff: ObjectDiff) {
  return (
    cDiff.type === 'object' &&
    cDiff.isChanged &&
    cDiff.action === 'removed' &&
    cDiff.toValue === undefined &&
    !childIsSpan(cDiff.fromValue as PortableTextChild)
  )
}

export function isAddMark(cDiff: ObjectDiff, cSchemaType?: SchemaType): boolean {
  if (!cSchemaType) {
    return false
  }
  return !!(
    cDiff.fields.marks &&
    cDiff.fields.marks.isChanged &&
    cDiff.fields.marks.action === 'added' &&
    Array.isArray(cDiff.fields.marks.toValue) &&
    cDiff.fields.marks.toValue.length > 0 &&
    cSchemaType.jsonType === 'object' &&
    cDiff.fields.marks.toValue.some(
      mark => typeof mark === 'string' && cSchemaType && isDecorator(mark, cSchemaType)
    )
  )
}

export function isRemoveMark(cDiff: ObjectDiff, cSchemaType?: SchemaType): boolean {
  if (!cSchemaType) {
    return false
  }
  return !!(
    cDiff.fields.marks &&
    cDiff.fields.marks.isChanged &&
    cDiff.fields.marks.action === 'removed' &&
    Array.isArray(cDiff.fields.marks.fromValue) &&
    cDiff.fields.marks.fromValue.some(
      mark => typeof mark === 'string' && cSchemaType && isDecorator(mark, cSchemaType)
    )
  )
}

function isAddAnnotation(cDiff: ObjectDiff, cSchemaType?: SchemaType): boolean {
  if (!cSchemaType) {
    return false
  }
  return !!(
    cDiff.fields.marks &&
    cDiff.fields.marks.isChanged &&
    cDiff.fields.marks.action === 'added' &&
    Array.isArray(cDiff.fields.marks.toValue) &&
    cDiff.fields.marks.toValue.length > 0 &&
    cSchemaType.jsonType === 'object' &&
    cDiff.fields.marks.toValue.some(
      mark => typeof mark === 'string' && cSchemaType && !isDecorator(mark, cSchemaType)
    )
  )
}

function isRemoveAnnotation(cDiff: ObjectDiff, cSchemaType?: SchemaType): boolean {
  if (!cSchemaType) {
    return false
  }
  return !!(
    cDiff.fields.marks &&
    cDiff.fields.marks.isChanged &&
    cDiff.fields.marks.action === 'removed' &&
    cSchemaType.jsonType === 'object' &&
    cDiff.fields.marks.fromValue &&
    Array.isArray(cDiff.fields.marks.fromValue) &&
    typeof cDiff.fields.marks.toValue !== 'undefined' &&
    cDiff.fields.marks.fromValue.some(
      mark => typeof mark === 'string' && cSchemaType && !isDecorator(mark, cSchemaType)
    )
  )
}

export function getChildSchemaType(fields: any[], child: PortableTextChild) {
  const childrenField = fields.find(f => f.name === 'children')
  const cSchemaType =
    (childrenField &&
      childrenField.type &&
      childrenField.type.jsonType === 'array' &&
      (childrenField.type.of.find(type => type.name === child._type) as ObjectSchemaType)) ||
    undefined
  return cSchemaType
}

export function diffDidRemove(blockDiff: ObjectDiff): boolean {
  return blockDiff.action === 'removed'
}

export function getDecorators(spanSchemaType: SpanTypeSchema): {title: string; value: string}[] {
  if (spanSchemaType.decorators) {
    return spanSchemaType.decorators
  }
  return []
}

export function isDecorator(name: string, schemaType: SpanTypeSchema): boolean {
  return getDecorators(schemaType).some(dec => dec.value === name)
}

export function childIsSpan(child: PortableTextChild): boolean {
  const isObject = typeof child === 'object'
  return isObject && typeof child._type === 'string' && child._type === 'span'
}

export function didChangeMarksOnly(diff: ObjectDiff): boolean {
  const from = blockToText(diff.fromValue as PortableTextBlock)
  const to = blockToText(diff.toValue as PortableTextBlock)
  const childrenDiff = diff.fields.children as ArrayDiff
  const hasMarkDiffs =
    !!childrenDiff &&
    childrenDiff.items.every(
      item => item.diff.isChanged && item.diff.type === 'object' && item.diff.fields.marks
    )
  return from === to && hasMarkDiffs
}

export function marksAreChangedByAction(
  diff: ObjectDiff,
  action: 'added' | 'removed' | 'changed'
): boolean {
  const childrenDiff = diff.fields.children as ArrayDiff
  const hasMarkDiffs =
    !!childrenDiff &&
    childrenDiff.items.some(
      item =>
        item.diff.isChanged &&
        item.diff.type === 'object' &&
        item.diff.fields.marks &&
        item.diff.fields.marks.action === action
    )
  return hasMarkDiffs
}

export function blockToText(block: PortableTextBlock | undefined | null): string {
  if (!block) {
    return ''
  }
  return block.children.map(child => child.text || '').join('')
}

export function blockToSymbolizedText(block: PortableTextBlock | undefined | null): string {
  if (!block) {
    return ''
  }
  return block.children
    .map(child => {
      let returned = child.text || ''
      if (child._type !== 'span') {
        returned = `<inlineObject key='${child._key}'/>`
      } else if (child.marks) {
        child.marks.forEach(mark => {
          returned = `<mark type='${mark}'>${returned}</mark>`
        })
      }
      return returned
    })
    .join('')
}

// eslint-disable-next-line complexity
export function prepareDiffForPortableText(
  diff: ObjectDiff
): [PortableTextDiff, PortableTextDiff | undefined] {
  const _diff: PortableTextDiff = {
    ...diff,
    displayValue:
      diff.action === 'removed'
        ? (diff.fromValue as PortableTextBlock)
        : (diff.toValue as PortableTextBlock)
  }

  // Add children that are removed to the display value (unless the whole block is removed)
  if (_diff.action !== 'removed') {
    const childrenDiff = _diff.fields.children as ArrayDiff
    const newChildren = [...(_diff?.toValue?.children || [])] as PortableTextChild[]
    const removedChildrenDiffs =
      (childrenDiff &&
        childrenDiff.items.filter(item => item.diff && item.diff.action === 'removed')) ||
      []
    removedChildrenDiffs.forEach(rDiff => {
      if (rDiff.fromIndex !== undefined) {
        const fromValue = rDiff.diff.fromValue as PortableTextChild
        if (fromValue._key) {
          newChildren.splice(rDiff.fromIndex, 0, fromValue)
        }
      }
    })
    _diff.displayValue = {..._diff.toValue, children: newChildren} as PortableTextBlock
  }

  // Special condition when the only change is adding marks (then just remove all the other diffs - like created new spans)
  const onlyMarksAreChanged = didChangeMarksOnly(_diff)
  if (onlyMarksAreChanged) {
    const childrenItem = _diff.fields.children
    if (childrenItem && childrenItem.type === 'array') {
      childrenItem.items.forEach(item => {
        if (item.diff.type === 'object') {
          const itemDiff = item.diff as ObjectDiff
          Object.keys(itemDiff.fields).forEach(key => {
            if (key !== 'marks') {
              delete itemDiff.fields[key]
            }
          })
        }
      })
    }
    return [_diff, undefined]
  }

  if (_diff.fromValue && _diff.toValue) {
    const fromText = blockToSymbolizedText(_diff.fromValue as PortableTextBlock)
    const toText = blockToSymbolizedText(_diff.toValue as PortableTextBlock)
    const toBogusValue = {
      ..._diff.displayValue,
      children: [
        {
          _type: 'span',
          _key: 'bogusSpanKey',
          text: toText,
          marks: []
        }
      ]
    }
    const fromBogusValue = {
      ..._diff.displayValue,
      children: [
        {
          _type: 'span',
          _key: 'bogusSpanKey',
          text: fromText,
          marks: []
        }
      ]
    }
    const bogusDiff = {
      action: 'changed',
      type: 'object',
      displayValue: toBogusValue,
      fromValue: fromBogusValue,
      toValue: toBogusValue,
      isChanged: true,
      fields: {
        children: {
          action: 'changed',
          type: 'array',
          isChanged: true,
          items: [
            {
              diff: {
                action: 'changed',
                type: 'object',
                isChanged: true,
                fields: {
                  text: {
                    type: 'string',
                    action: 'changed',
                    isChanged: true,
                    fromValue: fromText,
                    toValue: toText,
                    segments: buildSegments(fromText, toText).map(seg => ({
                      ...seg,
                      annotation: _diff.annotation
                    }))
                  }
                },
                fromValue: fromBogusValue.children[0],
                toValue: toBogusValue.children[0]
              },
              fromIndex: 0,
              toIndex: 0,
              hasMoved: false
            }
          ],
          fromValue: fromBogusValue.children,
          toValue: toBogusValue.children
        }
      }
    }
    return [_diff, bogusDiff as PortableTextDiff]
  }
  return [_diff as PortableTextDiff, undefined]
}

function buildSegments(
  fromInput: string,
  toInput: string
): {type: string; action: string; text: string}[] {
  const segments: {
    type: string
    action: string
    text: string
    child?: PortableTextChild
  }[] = []

  const dmpDiffs = dmp.diff_main(fromInput, toInput)
  dmp.diff_cleanupSemantic(dmpDiffs)

  let fromIdx = 0
  let toIdx = 0

  for (const [op, text] of dmpDiffs) {
    // eslint-disable-next-line default-case
    switch (op) {
      case DIFF_EQUAL:
        segments.push({
          type: 'stringSegment',
          action: 'unchanged',
          text
        })
        fromIdx += text.length
        toIdx += text.length
        break
      case DIFF_DELETE:
        segments.push({
          type: 'stringSegment',
          action: 'removed',
          text: fromInput.substring(fromIdx, fromIdx + text.length)
        })
        fromIdx += text.length
        break
      case DIFF_INSERT:
        segments.push({
          type: 'stringSegment',
          action: 'added',
          text: toInput.substring(toIdx, toIdx + text.length)
        })
        toIdx += text.length
        break
    }
  }

  return segments
}
