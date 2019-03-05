import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { NavLink, withRouter } from 'react-router-dom'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import AddIcon from '@material-ui/icons/Add'
import Icon from '@mdi/react'
import DeleteIcon from '@material-ui/icons/Delete'
import { mdiImport } from '@mdi/js'
import confirm from '../../../util/confirm'
import TableToolbar from '../../../common/TableToolbar'

const styles = theme => ({
  importButton: {
    fill: theme.palette.text.secondary
  },
  buttons: {
    display: 'flex'
  }
})

export class TransactionsToolbarComponent extends React.Component {
  onDelete = () => {
    confirm('Delete selected transactions?', 'Are you sure?').then(() => {
      this.props.handleDelete(this.props.account, this.props.selectedTransactions)
      this.props.resetSelection()
    })
  }

  render() {
    const {
      classes,
      account,
      handleNew,
      selectedTransactions
    } = this.props

    return (
      <TableToolbar
        title={`${account.institution} - ${account.name}`}
        subTitle={account.currency}
        selectedItems={selectedTransactions}
      >
        {selectedTransactions.length > 0 ? (
          <Tooltip title="Delete">
            <IconButton aria-label="Delete" onClick={this.onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <div className={classes.buttons}>
            <Tooltip title="Import transaction">
              <IconButton
                aria-label="Import transaction"
                component={NavLink}
                to={`/accounts/${account.id}/import`}
              >
                <Icon
                  path={mdiImport}
                  size={1}
                  className={classes.importButton}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="New transaction">
              <IconButton aria-label="New transaction" onClick={handleNew}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </TableToolbar>
    )
  }
}

TransactionsToolbarComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  handleNew: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  selectedTransactions: PropTypes.array.isRequired,
  resetSelection: PropTypes.func.isRequired
}

export default withStyles(styles)(withRouter(TransactionsToolbarComponent))
