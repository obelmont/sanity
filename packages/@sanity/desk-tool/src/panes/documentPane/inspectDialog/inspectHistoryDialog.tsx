import React from 'react'
import Spinner from 'part:@sanity/components/loading/spinner'
import {InspectDialog} from './inspectDialog'

interface Props {
  document: {isLoading: boolean; snapshot: any}
}

export function InspectHistoryDialog(props: Props) {
  const {document} = props
  const {isLoading, snapshot} = document

  return isLoading ? <Spinner /> : <InspectDialog value={snapshot} />
}
