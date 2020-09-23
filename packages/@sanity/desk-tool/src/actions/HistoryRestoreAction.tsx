import {useDocumentOperation} from '@sanity/react-hooks'
import {useRouter} from 'part:@sanity/base/router'
import HistoryIcon from 'part:@sanity/base/history-icon'
import React, {useCallback} from 'react'

export function HistoryRestoreAction({id, type, revision, onComplete}) {
  const {restore}: any = useDocumentOperation(id, type)
  const router = useRouter()
  const [isConfirmDialogOpen, setConfirmDialogOpen] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const handleConfirm = useCallback(() => {
    restore.execute(revision)
    router.navigateIntent('edit', {id, type})
    onComplete()
  }, [revision, restore, router, onComplete, id, type])

  return {
    label: 'Restore',
    color: 'primary',
    onHandle: () => {
      setConfirmDialogOpen(true)
    },
    title: 'Restore to this version',
    icon: HistoryIcon,
    dialog:
      (!error &&
        isConfirmDialogOpen && {
          type: 'confirm',
          color: 'danger',
          onCancel: onComplete,
          onConfirm: handleConfirm,
          message: <>Are you sure you want to restore this document?</>
        }) ||
      (error && {
        type: 'error',
        onClose: () => setError(null),
        title: 'An error occured',
        content: error.message
      })
  }
}
