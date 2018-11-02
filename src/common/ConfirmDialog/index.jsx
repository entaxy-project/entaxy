import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import { confirmable } from 'react-confirm'

const ConfirmDialog = ({
  title,
  description,
  show,
  proceed,
  dismiss
}) => (
  <Dialog
    disableBackdropClick
    disableEscapeKeyDown
    maxWidth="xs"
    aria-labelledby="confirmation-dialog-title"
    open={show}
  >
    <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
    <DialogContent>{description}</DialogContent>
    <DialogActions>
      <Button onClick={dismiss} color="primary">
        Cancel
      </Button>
      <Button onClick={proceed} color="primary">
        Ok
      </Button>
    </DialogActions>
  </Dialog>
)

ConfirmDialog.propTypes = {
  show: PropTypes.bool.isRequired, // from confirmable. indicates if the dialog is shown or not.
  proceed: PropTypes.func.isRequired, // from confirmable. call to close the dialog with promise resolved.
  dismiss: PropTypes.func.isRequired, // from confirmable. call to only close the dialog.
  title: PropTypes.string.isRequired, // the title of the dialog
  description: PropTypes.string.isRequired // the description of the dialog
}

export default confirmable(ConfirmDialog)
