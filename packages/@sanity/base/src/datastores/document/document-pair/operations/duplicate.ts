import {OperationArgs} from '../../types'
import {getDraftId} from '../../../../util/draftUtils'
import uuid from '@sanity/uuid'
import client from 'part:@sanity/base/client'
import {omit} from 'lodash'

const id = <T>(id: T): T => id

export const duplicate = {
  disabled: ({snapshots}: OperationArgs) => {
    return snapshots.published || snapshots.draft ? false : 'NOTHING_TO_DUPLICATE'
  },
  execute: ({snapshots}: OperationArgs, prepare = id) => {
    const omitProps = ['_id', '_createdAt', '_updatedAt']
    const source = snapshots.draft || snapshots.published
    const dupeId = uuid()
    return client
      .create({_id: getDraftId(dupeId), ...omit(prepare(source), omitProps)})
      .then(() => dupeId)
  }
}
