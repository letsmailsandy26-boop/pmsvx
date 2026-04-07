import { Modal } from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmLabel?: string
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Delete',
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="px-5 py-4">
        <p className="text-xs text-op-text">{message}</p>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
