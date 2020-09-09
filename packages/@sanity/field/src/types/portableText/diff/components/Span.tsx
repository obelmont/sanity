import React from 'react'
import {isEqual} from 'lodash'
import {PortableTextChild, PortableTextBlock} from '../types'
import {AnnotatedStringDiff, ObjectDiff, StringDiff} from '../../../../diff'
import {blockToText} from '../helpers'
import styles from './Span.css'

type Props = {
  block: PortableTextBlock
  // eslint-disable-next-line react/require-default-props
  diff?: ObjectDiff
  span: PortableTextChild
}
export default function Span(props: Props): JSX.Element {
  const {diff, span, block} = props
  let returned = <>{span.text}</>
  if (span.text === '') {
    returned = <span className={styles.empty}>&nbsp;</span> // Visualize?
  } else if (diff) {
    const textDiff = diff.fields.text as StringDiff
    if (textDiff && textDiff.isChanged) {
      // console.log(textDiff)
      // // Test to see if this span is created by adding a mark to a word
      // const myIndex = block.children.findIndex(chld => chld._key === span._key)
      // const nextSpan = block.children[myIndex + 1]
      // const nextSpanHasDifferentMarks = !isEqual(span.marks, nextSpan && nextSpan.marks)
      // // eslint-disable-next-line max-depth
      // if (nextSpanHasDifferentMarks) {
      //   const rest = block.children.slice(block.children.indexOf(span) + 1)
      //   const restText = blockToText({_key: 'bogus', _type: 'block', children: rest})
      //   console.log(restText)
      //   textDiff.segments = textDiff.segments.filter(seg => restText.indexOf(seg.text))
      // }
      returned = <AnnotatedStringDiff diff={textDiff} />
    }
  }
  return <span className={styles.root}>{returned}</span>
}
