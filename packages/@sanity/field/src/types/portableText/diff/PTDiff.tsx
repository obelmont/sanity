import React, {useMemo} from 'react'

import {DiffComponent, ObjectDiff, ObjectSchemaType} from '../../../diff'
import Block from './components/Block'
import {createChildMap, prepareDiffForPortableText} from './helpers'

import styles from './PTDiff.css'

export const PTDiff: DiffComponent<ObjectDiff> = function PTDiff({
  diff,
  schemaType
}: {
  diff: ObjectDiff
  schemaType: ObjectSchemaType
}) {
  const _diff = prepareDiffForPortableText(diff)
  const childMap = useMemo(() => createChildMap(_diff, schemaType), [diff])
  const portableText = useMemo(() => <Block diff={_diff} childMap={childMap} />, [diff])
  const classNames = [styles.root, styles[_diff.action]].join(' ')
  return (
    <div className={classNames}>
      {/* Diff */}
      <div className={styles.block}>{portableText}</div>

      {/* Summarize changes */}
      <ul className={styles.summary}>
        {Object.keys(childMap)
          .map(key => childMap[key])
          .map(mapEntry => {
            return mapEntry.summary.map((line, i) => (
              <li key={`summary-${mapEntry.child._key.concat(i.toString())}`}>{line}</li>
            ))
          })}
      </ul>
    </div>
  )
}
