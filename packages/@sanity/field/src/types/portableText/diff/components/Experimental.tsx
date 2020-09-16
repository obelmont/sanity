import React, {SyntheticEvent} from 'react'
import {flatten, remove} from 'lodash'
import {PortableTextBlock, PortableTextChild, ChildMap, PortableTextDiff} from '../types'
import {
  isDecorator,
  isHeader,
  childIsSpan,
  UNKNOWN_TYPE_NAME,
  getChildSchemaType,
  MARK_SYMBOLS,
  getDecorators,
  ANNOTATION_SYMBOLS
} from '../helpers'

import {
  ArrayDiff,
  DiffAnnotation,
  DiffAnnotationTooltip,
  ObjectDiff,
  useDiffAnnotationColor,
  StringDiffSegment
} from '../../../../diff'
import {ObjectSchemaType} from '../../../../types'
import Annotation from './Annotation'
import Decorator from './Decorator'
import InlineObject from './InlineObject'
import Blockquote from './Blockquote'
import Header from './Header'
import Paragraph from './Paragraph'
import Span from './Span'

import styles from './Block.css'

type Props = {
  diff: PortableTextDiff
  childMap: ChildMap
  experimentalDiff: PortableTextDiff
  schemaType: ObjectSchemaType
}

export default function Block(props: Props): JSX.Element {
  const {diff, childMap, experimentalDiff, schemaType} = props

  const handleObjectFocus = (event: SyntheticEvent<HTMLSpanElement>) => {
    // TODO: implement this later on when we can do focus in the editor pane
    // eslint-disable-next-line no-alert
    alert('Focus object here!')
  }

  // eslint-disable-next-line complexity
  const renderBlock = ({
    block,
    children
  }: {
    block: PortableTextBlock
    children: React.ReactNode
  }): JSX.Element => {
    const classNames = [styles.root, diff.action, `style_${diff.displayValue.style || 'undefined'}`]
    let returned: React.ReactNode = children
    let fromStyle

    // If style was changed, indicate that
    if (diff.action === 'changed' && diff.fields.style && diff.fields.style.action === 'changed') {
      fromStyle = diff.fromValue.style
      classNames.push(`changed_from_style_${fromStyle || 'undefined'}`)
      const color = useDiffAnnotationColor(diff, [])
      const style = color ? {background: color.background, color: color.text} : {}

      returned = (
        <div className={styles.styleIsChanged}>
          <div className={styles.changedBlockStyleNotice}>
            <DiffAnnotationTooltip diff={diff.fields.style} as={'div'}>
              Changed block style from '{fromStyle}'
            </DiffAnnotationTooltip>
          </div>
          <div style={style}>{returned}</div>
        </div>
      )
    }

    if (block.style === 'blockquote') {
      returned = <Blockquote block={block}>{returned}</Blockquote>
    } else if (block.style && isHeader(block)) {
      returned = (
        <Header block={block} style={block.style}>
          {returned}
        </Header>
      )
    } else {
      returned = <Paragraph block={block}>{returned}</Paragraph>
    }
    return <div className={classNames.join(' ')}>{returned}</div>
  }

  const renderWithMarks = (activeMarks, removedMarks, text, spanSchemaType) => {
    const allMarks = [...activeMarks, ...removedMarks]
    if (allMarks.length) {
      let returned = <>{text}</>
      // eslint-disable-next-line complexity
      allMarks.forEach(mark => {
        if (isDecorator(mark, spanSchemaType)) {
          // TODO: check if this decorator was added / changed
          const spanDiff =
            diff.fields.children &&
            diff.fields.children.action === 'changed' &&
            diff.fields.children.type === 'array' &&
            (diff.fields.children.items.find(
              item =>
                item.diff &&
                item.diff.type === 'object' &&
                item.diff.fields.marks &&
                item.diff.fields.marks.type === 'array' &&
                ((Array.isArray(item.diff.fields.marks.toValue) &&
                  item.diff.fields.marks.toValue.includes(mark)) ||
                  (Array.isArray(item.diff.fields.marks.fromValue) &&
                    item.diff.fields.marks.fromValue.includes(mark)))
            )?.diff as ObjectDiff)
          const marksDiff =
            spanDiff &&
            spanDiff.fields.marks &&
            spanDiff.fields.marks.type === 'array' &&
            spanDiff.fields.marks.action !== 'unchanged' &&
            spanDiff.fields.marks.items.find(
              item => item.diff.toValue === mark || item.diff.fromValue === mark
            )?.diff
          const isRemoved = marksDiff ? marksDiff.action === 'removed' : false
          if (marksDiff && marksDiff.action !== 'unchanged') {
            returned = (
              <DiffAnnotation
                annotation={marksDiff.annotation}
                description={`Formatting ${marksDiff.action} by`}
              >
                {returned}
              </DiffAnnotation>
            )
          }
          if (!isRemoved) {
            returned = (
              <Decorator block={block} mark={mark}>
                {returned}
              </Decorator>
            )
          }
        } else {
          const annotationDiff =
            diff.fields.markDefs &&
            diff.fields.markDefs.isChanged &&
            diff.fields.markDefs.type === 'array' &&
            diff.fields.markDefs.items.find(
              item =>
                item.diff &&
                item.diff.type === 'object' &&
                item.diff.toValue &&
                item.diff.toValue._key &&
                item.diff.toValue._key === mark
            )?.diff
          returned = (
            <Annotation block={block} markDefKey={mark} onClick={handleObjectFocus}>
              {annotationDiff && annotationDiff.action !== 'unchanged' ? (
                <DiffAnnotation
                  annotation={annotationDiff.annotation}
                  as="ins"
                  description={`Annotation ${annotationDiff.action} by`}
                >
                  {returned}
                </DiffAnnotation>
              ) : (
                returned
              )}
            </Annotation>
          )
        }
      })
      return returned
    }
    return text
  }

  const renderChild = (child: PortableTextChild) => {
    const spanSchemaType = getChildSchemaType(schemaType.fields, child)
    let decoratorTypes: {title: string; value: string}[] = []
    if (spanSchemaType) {
      decoratorTypes = getDecorators(spanSchemaType)
    }
    const childrenDiff = experimentalDiff.fields.children as ArrayDiff
    const experimentalSegments =
      (childrenDiff.items[0].diff &&
        childrenDiff.items[0].diff.type === 'object' &&
        childrenDiff.items[0].diff.fields.text.type === 'string' &&
        childrenDiff.items[0].diff.fields.text.segments) ||
      []
    console.log('experimentalSegments', experimentalSegments)
    // Clean up mark segements
    const segments: StringDiffSegment[] = flatten(
      // eslint-disable-next-line complexity
      experimentalSegments.map(seg => {
        const newSegments: StringDiffSegment[] = []
        const isMarkStart = seg.text.match(/<.>/i)
        const isMarkEnd = seg.text.match(/<\/.>/i)
        if (isMarkStart && !isMarkEnd && seg.text.length > 3) {
          const texts = seg.text.split(/<.>/i)
          const segs = [...texts.map(text => ({...seg, text})), {...seg, text: isMarkStart[0]}]
          segs.forEach(nSeg => newSegments.push(nSeg))
        } else if (isMarkEnd && !isMarkStart && seg.text.length > 4) {
          const texts = seg.text.split(/<\/.>/i)
          const segs = [...texts.map(text => ({...seg, text})), {...seg, text: isMarkEnd[0]}]
          segs.forEach(nSeg => newSegments.push(nSeg))
        } else if (isMarkStart && isMarkEnd && seg.text.length > 7) {
          let testString = ''
          seg.text.split('').forEach(char => {
            testString += char
            if (testString.substring(testString.length - 3) === isMarkStart[0]) {
              newSegments.push({...seg, text: testString.substring(0, testString.length - 3)})
              newSegments.push({...seg, text: isMarkStart[0]})
              testString = ''
            } else if (testString.substring(testString.length - 4) === isMarkEnd[0]) {
              newSegments.push({...seg, text: testString.substring(0, testString.length - 4)})
              newSegments.push({...seg, text: isMarkEnd[0]})
              testString = ''
            }
          })
          newSegments.push({...seg, text: testString})
        }
        if (newSegments.length === 0) {
          newSegments.push(seg)
        }
        // TODO: there are possibly some other edge cases here that needs to be split into new segments.
        return newSegments
      })
    )
    console.log('segments', segments)
    const returnedChildren: any[] = []
    let activeMarks: string[] = []
    let removedMarks: string[] = []
    // eslint-disable-next-line complexity
    segments.forEach(seg => {
      const isInline = seg.text.startsWith('<inlineObject')
      const isMarkStart =
        seg.text &&
        seg.text[0] &&
        seg.text[0] === '<' &&
        seg.text[1] &&
        (MARK_SYMBOLS.includes(seg.text[1]) || ANNOTATION_SYMBOLS.includes(seg.text[1]))
      const isMarkEnd =
        seg.text &&
        seg.text.substring(0, 2) === '</' &&
        seg.text[2] &&
        (MARK_SYMBOLS.includes(seg.text[2]) || ANNOTATION_SYMBOLS.includes(seg.text[2]))
      if (isMarkStart) {
        const _isDecorator = MARK_SYMBOLS.includes(seg.text[1])
        const mark = _isDecorator
          ? decoratorTypes[MARK_SYMBOLS.indexOf(seg.text[1])]?.value
          : diff.toValue && diff.toValue.markDefs[ANNOTATION_SYMBOLS.indexOf(seg.text[1])]?._key
        if (seg.action === 'removed') {
          removedMarks.push(mark)
        } else {
          activeMarks.push(mark)
        }
      } else if (isMarkEnd) {
        if (seg.action === 'removed') {
          removedMarks = removedMarks.slice(0, -1)
        } else {
          activeMarks = activeMarks.slice(0, -1)
        }
      } else if (isInline) {
        const keyMatch = seg.text.match(/key='([A-Za-z0-9 _]*)'/)
        const key = keyMatch && keyMatch[1]
        const realChild = diff.displayValue.children.find(
          cld => cld._key === key
        ) as PortableTextChild
        if (key) {
          const realDiff = childMap[key]?.diff as ObjectDiff
          returnedChildren.push(renderInlineObject({child: realChild, diff: realDiff}))
        }
      } else if (seg.action === 'unchanged') {
        returnedChildren.push(renderWithMarks(activeMarks, removedMarks, seg.text, spanSchemaType))
      } else if (seg.action === 'removed') {
        // TODO: find annotation
        returnedChildren.push(
          <DiffAnnotation annotation={seg.annotation} as="del" description="Text removed by">
            {renderWithMarks(activeMarks, removedMarks, seg.text, spanSchemaType)}
          </DiffAnnotation>
        )
      } else if (seg.action === 'added') {
        // TODO: find annotation
        returnedChildren.push(
          <DiffAnnotation annotation={seg.annotation} as="ins" description="Text added by">
            {renderWithMarks(activeMarks, removedMarks, seg.text, spanSchemaType)}
          </DiffAnnotation>
        )
      }
    })
    return React.createElement('div', {}, ...returnedChildren)
  }

  const renderSpan = (sProps: {
    child: PortableTextChild
    diff?: ObjectDiff
    experimentalDiff?: ObjectDiff
    blockDiff?: ObjectDiff
  }): React.ReactNode => {
    return (
      <Span
        key={`span-${sProps.child._key}`}
        block={block}
        blockDiff={sProps.blockDiff}
        diff={sProps.diff}
        span={sProps.child}
      />
    )
  }

  // Set up renderers for inline object types
  // TODO: previews from schema
  const renderInlineObject = (cProps: {
    child: PortableTextChild
    diff: ObjectDiff
  }): React.ReactNode => {
    return (
      <InlineObject
        key={`inline-object-${cProps.child._key}`}
        object={cProps.child}
        diff={cProps.diff}
        onClick={handleObjectFocus}
      />
    )
  }
  const renderInvalidInlineObjectType = () => {
    return <span>Invalid inline object type</span>
  }
  const renderObjectTypes = {}
  Object.keys(childMap)
    .map(key => childMap[key])
    .forEach(mapEntry => {
      const {child} = mapEntry
      if (!childIsSpan(child) && child._type) {
        renderObjectTypes[child._type] = renderInlineObject
      } else {
        // This should not happen at this point. But have a fallback for rendering missing types anyway.
        renderObjectTypes[UNKNOWN_TYPE_NAME] = renderInvalidInlineObjectType
      }
    })
  const block = diff.displayValue
  return renderBlock({
    block,
    children: (experimentalDiff.displayValue.children || []).map(child => renderChild(child))
  })
}
