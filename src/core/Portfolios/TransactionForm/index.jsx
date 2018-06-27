/* eslint-disable no-unused-vars */

import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'

const styles = theme => ({
  root: {
    display: 'inline'
  },
  input: {
    margin: '5px'
  }
})

class TransactionForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false
    }
  }

  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Button size="small" color="inherit" onClick={this.handleClickOpen}>
          New Transaction
        </Button>
        <Dialog
          aria-labelledby="form-dialog-title"
          open={this.state.open}
          onClose={this.handleClose}
        >
          <DialogTitle id="form-dialog-title">Add new transaction</DialogTitle>
          <DialogContent>
            <Input
              placeholder="Source"
              inputProps={{ 'aria-label': 'Source' }}
              className={classes.input}
            />
            <Input
              placeholder="Ticker"
              inputProps={{ 'aria-label': 'Ticker' }}
              className={classes.input}
            />
            <Input
              placeholder="Shares"
              inputProps={{ 'aria-label': 'Shares' }}
              className={classes.input}
            />
            <Input
              placeholder="Purchase Price"
              inputProps={{ 'aria-label': 'Price' }}
              className={classes.input}
            />
            <Input
              placeholder="Purchase date"
              inputProps={{ 'aria-label': 'Date' }}
              className={classes.input}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleClose} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

TransactionForm.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(TransactionForm)
