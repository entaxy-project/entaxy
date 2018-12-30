import React from 'react'
import PropTypes from 'prop-types'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'

const ModalDialog = ({
  title,
  children,
  onSubmit,
  onCancel,
  open
}) => (
  <Dialog
    aria-labelledby="form-dialog-title"
    open={open}
    onClose={onCancel}
  >
    <DialogTitle id="form-dialog-title">{title}</DialogTitle>
    <Divider />
    <form onSubmit={onSubmit}>
      <DialogContent>
        {children}
      </DialogContent>
      <DialogActions>
        <Button type="submit" color="primary">Save</Button>
        <Button onClick={onCancel} color="primary">Close</Button>
      </DialogActions>
    </form>
  </Dialog>
)

ModalDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}

export default ModalDialog
