import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { NavLink, withRouter } from 'react-router-dom'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import AddIcon from '@material-ui/icons/Add'
import Icon from '@mdi/react'
// import { mdiFileUploadOutline, mdiUploadNetwork, mdiImport } from '@mdi/js'
import { mdiImport } from '@mdi/js'
import TableToolbar from '../../../common/TableToolbar'

const styles = theme => ({
  importButton: {
    fill: theme.palette.text.secondary
  }
})

export class TransactionsToolbarComponent extends React.Component {
  pageTitle = (account) => {
    if (account) {
      return `${account.institution} - ${account.name}`
    }
    return null
  }

  render() {
    const {
      classes,
      account,
      handleNew,
      handleDelete,
      selectedTransactions
    } = this.props

    return (
      <TableToolbar
        title={this.pageTitle(account)}
        selectedItems={selectedTransactions}
        onDelete={handleDelete}
      >
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
      </TableToolbar>
    )
  }
}

TransactionsToolbarComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  handleNew: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  selectedTransactions: PropTypes.array.isRequired
}

export default withStyles(styles)(withRouter(TransactionsToolbarComponent))
