/* eslint-disable max-depth */
import React, {useCallback, Fragment} from 'react'
import {useDocumentOperation} from '@sanity/react-hooks'
import {ObjectDiff, ObjectSchemaType, ArrayDiff} from '@sanity/field/diff'
import {FallbackDiff} from '../../../diffs/_fallback/FallbackDiff'
import {resolveDiffComponent} from '../../../diffs/resolveDiffComponent'
import {useDocumentPane} from '../use'
import {useDocument} from '../utils/document'
import {buildChangeList} from './buildChangeList'
import {DiffErrorBoundary} from './diffErrorBoundary'
import {OperationsAPI, ChangeNode, ArrayChangeNode, FieldChangeNode, GroupChangeNode} from './types'
import {undoChange} from './undoChange'

import styles from './changesPanel.css'

export function ChangesPanel() {
  const doc = useDocument()
  const {closeHistory, timeline} = useDocumentPane()
  const diff: ObjectDiff | null = timeline && (timeline.currentDiff() as any)

  if (!diff || diff.type !== 'object') {
    return null
  }

  const changes = buildChangeList(doc.schemaType as ObjectSchemaType, diff)
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.mainNav}>
          <h2 className={styles.title}>Changes</h2>
          <div className={styles.closeButtonContainer}>
            <button onClick={closeHistory} type="button">
              Close
            </button>
          </div>
        </div>
        <div>
          <div style={{display: 'inline-block', border: '1px solid #ccc'}}>
            Since last published &darr;
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.changeList}>
          {changes.map(change => (
            <ChangeResolver change={change} key={change.key} level={0} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ArrayChange({change, level = 0}: {change: ArrayChangeNode; level: number}) {
  const DiffComponent = resolveDiffComponent<ArrayDiff>(change.schemaType) || FallbackDiff
  const doc = useDocument()
  const docOperations = useDocumentOperation(doc.id, doc.typeName) as OperationsAPI
  const handleUndoChange = useCallback(() => undoChange(change.diff, change.path, docOperations), [
    doc.id,
    change.key,
    change.diff
  ])

  return (
    <div className={styles.arrayChange}>
      <div className={styles.change__header}>
        <div className={styles.change__breadcrumb}>
          {change.titlePath.slice(level).map((titleSegment, idx) => (
            <Fragment key={idx}>
              {idx > 0 && <> › </>}
              <strong>{titleSegment}</strong>
            </Fragment>
          ))}
        </div>

        <button type="button" className={styles.change__revertButton} onClick={handleUndoChange}>
          Revert changes
        </button>
      </div>

      <DiffErrorBoundary>
        <DiffComponent diff={change.diff} schemaType={change.schemaType} items={change.items} />
      </DiffErrorBoundary>
    </div>
  )
}

function FieldChange({change, level = 0}: {change: FieldChangeNode; level: number}) {
  const DiffComponent = resolveDiffComponent(change.schemaType) || FallbackDiff
  const doc = useDocument()
  const docOperations = useDocumentOperation(doc.id, doc.typeName) as OperationsAPI
  const handleUndoChange = useCallback(() => undoChange(change.diff, change.path, docOperations), [
    doc.id,
    change.key,
    change.diff
  ])

  return (
    <div className={styles.fieldChange}>
      <div className={styles.change__header}>
        <div className={styles.change__breadcrumb}>
          {change.titlePath.slice(level).map((titleSegment, idx) => (
            <Fragment key={idx}>
              {idx > 0 && <> › </>}
              <strong>{titleSegment}</strong>
            </Fragment>
          ))}
        </div>

        <button type="button" className={styles.change__revertButton} onClick={handleUndoChange}>
          Revert changes
        </button>
      </div>

      <DiffErrorBoundary>
        <DiffComponent diff={change.diff} schemaType={change.schemaType} />
      </DiffErrorBoundary>
    </div>
  )
}

function GroupChange({change: group}: {change: GroupChangeNode}) {
  const {titlePath, changes} = group
  return (
    <div className={styles.groupChange}>
      <div className={styles.change__header}>
        <div className={styles.change__breadcrumb}>
          {titlePath.map((titleSegment, idx) => (
            <Fragment key={idx}>
              {idx > 0 && <> › </>}
              <strong>{titleSegment}</strong>
            </Fragment>
          ))}
        </div>

        <button type="button" className={styles.change__revertButton}>
          Revert changes
        </button>
      </div>

      <div className={styles.changeList}>
        {changes.map(change => (
          <ChangeResolver key={change.key} change={change} level={change.titlePath.length - 1} />
        ))}
      </div>
    </div>
  )
}

function ChangeResolver({change, level = 0}: {change: ChangeNode; level: number}) {
  if (change.type === 'array') {
    return <ArrayChange change={change} level={level} />
  }

  if (change.type === 'field') {
    return <FieldChange change={change} level={level} />
  }

  if (change.type === 'group') {
    return <GroupChange change={change} />
  }

  return <div>Unknown change type: {(change as any).type}</div>
}
