import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
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
import Grid from '@material-ui/core/Grid'

const useStyles = makeStyles((theme) => ({
  dialogMargin: {
    marginLeft: 15,
    marginRight: 15
  },
  formHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '24px 10px 16px 15px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
  },
  closeButton: {
    marginTop: -10
  },
  formFooter: {
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'space-between'
  },
  saveButton: {
    float: 'right'
  },
  deleteButton: {
    color: theme.palette.danger.icon,
    marginLeft: theme.spacing(2)
  }
}))

const ModalDialog = ({
  title,
  children,
  onSubmit,
  onCancel,
  onDelete,
  open,
  className,
  maxWidth,
  fullWidth
}) => {
  const classes = useStyles()

  return (
    <Dialog
      aria-labelledby="form-dialog-title"
      open={open}
      scroll="body"
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      onClose={onCancel}
      className={className}
    >
      <div className={classes.dialogMargin}>
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
            <Grid container>
              <Grid item xs={8}>
                {(onDelete) && (
                  <Button onClick={onDelete} className={classes.deleteButton}>Delete this transaction</Button>
                )}
              </Grid>
              <Grid item xs={4}>
                <Button type="submit" color="secondary" className={classes.saveButton}>Save</Button>
              </Grid>
            </Grid>
          </DialogActions>
        </form>
      </div>
    </Dialog>
  )
}

ModalDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  className: PropTypes.string,
  maxWidth: PropTypes.string,
  fullWidth: PropTypes.bool
}

ModalDialog.defaultProps = {
  className: null,
  onDelete: null,
  maxWidth: null,
  fullWidth: false
}

export default ModalDialog
