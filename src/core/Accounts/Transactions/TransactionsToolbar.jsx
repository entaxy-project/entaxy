import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import AddIcon from '@material-ui/icons/Add'
import Icon from '@mdi/react'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import Paper from '@material-ui/core/Paper'
import Fade from '@material-ui/core/Fade'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { mdiFileUploadOutline, mdiUploadNetwork, mdiImport } from '@mdi/js'
import TableToolbar from '../../../common/TableToolbar'
import { institutionsData } from '../../../store/accounts/selectors'

const styles = theme => ({
  importButton: {
    fill: theme.palette.text.secondary
  }
})


const initialState = {
  anchorEl: null,
  openPopup: false,
  selectedInstitution: null,
  selectedImportType: null,
  showTransactions: false,
  transactions: [],
  errors: {}
}

export class TransactionsToolbarComponent extends React.Component {
  state = initialState

  pageTitle = (account) => {
    if (account) {
      return `${account.institution} - ${account.name}`
    }
    return null
  }

  showPopup = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
      openPopup: true
    })
  }

  closePopup = () => {
    this.setState({
      openPopup: false
    })
  }

  handlePopupSelection = (importType) => {
    this.props.history.push(`/accounts/${this.props.account.id}/import/${importType}`)
  }

  resetSelection = () => {
    this.setState(initialState)
  }

  render() {
    const {
      classes,
      account,
      handleNew,
      handleDelete,
      selectedTransactions
    } = this.props
    const {
      anchorEl,
      openPopup
    } = this.state

    return (
      <TableToolbar
        title={this.pageTitle(account)}
        selectedItems={selectedTransactions}
        onDelete={handleDelete}
      >
        <ClickAwayListener onClickAway={this.closePopup}>
          <Tooltip title="Import transaction">
            <IconButton aria-label="Import transaction" onClick={this.showPopup}>
              <Icon
                path={mdiImport}
                size={1}
                className={classes.importButton}
              />
            </IconButton>
          </Tooltip>
        </ClickAwayListener>
        <Tooltip title="New transaction">
          <IconButton aria-label="New transaction" onClick={handleNew}>
            <AddIcon />
          </IconButton>
        </Tooltip>
        <Popper open={openPopup} anchorEl={anchorEl} placement="bottom-start" transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper>
                <MenuList role="menu">
                  {institutionsData[account.institution].importTypes.map(importType => (
                    <MenuItem key={importType} onClick={() => this.handlePopupSelection(importType)}>
                      <Icon
                        path={(importType === 'CSV' ? mdiFileUploadOutline : mdiUploadNetwork)}
                        size={1}
                        className={classes.menuIcon}
                      />
                      {importType}
                    </MenuItem>
                  ))}
                </MenuList>

              </Paper>
            </Fade>
          )}
        </Popper>
      </TableToolbar>
    )
  }
}

TransactionsToolbarComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  handleNew: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  selectedTransactions: PropTypes.array.isRequired
}

export default withStyles(styles)(withRouter(TransactionsToolbarComponent))
