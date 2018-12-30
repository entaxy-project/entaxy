import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'

const styles = () => ({
  formwrapper: {
    marginLeft: 15,
    marginRight: 15
  },
  formHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '24px 24px 15px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
  },
  closeButton: {
    marginTop: -10
  },
  formFooter: {
    marginTop: 10,
    marginBottom: 10
  }
})

const ModalDialog = ({
  title,
  children,
  onSubmit,
  onCancel,
  open,
  classes
}) => (
  <Dialog
    aria-labelledby="form-dialog-title"
    open={open}
    onClose={onCancel}
  >
    <div className={classes.formwrapper}>
      <DialogTitle disableTypography className={classes.formHeader}>
        <Typography variant="h6">{title}</Typography>
        <IconButton aria-label="Close" onClick={onCancel} className={classes.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          {children}
        </DialogContent>
        <Divider />
        <DialogActions className={classes.formFooter}>
          <Button type="submit" color="secondary">Save</Button>
        </DialogActions>
      </form>
    </div>
  </Dialog>
)

ModalDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ModalDialog)
