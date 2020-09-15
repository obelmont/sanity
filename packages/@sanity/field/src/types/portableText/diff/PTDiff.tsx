import React, {useMemo} from 'react'

import {DiffComponent, ObjectDiff, ObjectSchemaType} from '../../../diff'
import Block from './components/Block'
import Experimental from './components/Experimental'
import {createChildMap, prepareDiffForPortableText} from './helpers'

import styles from './PTDiff.css'

export const PTDiff: DiffComponent<ObjectDiff> = function PTDiff({
  diff,
  schemaType
}: {
  diff: ObjectDiff
  schemaType: ObjectSchemaType
}) {
  const [ptDiff, experimentalDiff] = prepareDiffForPortableText(diff)
  const childMap = useMemo(() => createChildMap(ptDiff, schemaType), [diff])
  const portableTextDiff = useMemo(() => <Block diff={ptDiff} childMap={childMap} />, [diff])
  let experimentalPortableTextDiff: any = null
  if (experimentalDiff) {
    experimentalPortableTextDiff = useMemo(
      () => (
        <Experimental
          diff={ptDiff}
          childMap={childMap}
          experimentalDiff={experimentalDiff}
          schemaType={schemaType}
        />
      ),
      [diff]
    )
  }
  const classNames = [styles.root, styles[diff.action]].join(' ')
  return (
    <div className={classNames}>
      {portableTextDiff}
      {experimentalPortableTextDiff && <div>EXPERIMENTAL: {experimentalPortableTextDiff}</div>}
    </div>
  )
}
