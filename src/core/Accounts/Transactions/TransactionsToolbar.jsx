import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import AddIcon from '@material-ui/icons/Add'
import Icon from '@mdi/react'
import DeleteIcon from '@material-ui/icons/Delete'
import { mdiImport } from '@mdi/js'
import InputBase from '@material-ui/core/InputBase'
import SearchIcon from '@material-ui/icons/Search'
import CancelIcon from '@material-ui/icons/Cancel'
import { fade } from '@material-ui/core/styles/colorManipulator'
import confirm from '../../../util/confirm'
import TableToolbar from '../../../common/TableToolbar'
import LinkTo from '../../../common/LinkTo'

const styles = theme => ({
  importButton: {
    fill: theme.palette.text.secondary
  },
  buttons: {
    display: 'flex'
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: fade(theme.palette.grey[400], 0.15),
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    '&:hover': {
      backgroundColor: fade(theme.palette.grey[400], 0.25)
    }
  },
  searchIcon: {
    width: theme.spacing(9),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#bbb'
  },
  clearIcon: {
    position: 'absolute',
    right: theme.spacing(2),
    padding: 0,
    marginTop: theme.spacing(2),
    color: '#999'
  },
  inputRoot: {
    color: 'inherit',
    width: '100%'
  },
  inputInput: {
    paddingTop: theme.spacing(1) * 1.8,
    paddingRight: theme.spacing(5),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(8),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      minWidth: 230
    }
  }
})

export class TransactionsToolbarComponent extends React.Component {
  onDelete = () => {
    confirm('Delete selected transactions?', 'Are you sure?').then(() => {
      this.props.handleDelete(this.props.account, this.props.selectedTransactions)
      this.props.resetSelection()
    })
  }

  onChangeSearch = ({ target: { value } }) => {
    const { filterProps } = this.props
    if (value !== '') {
      filterProps.setFilter({
        attr: 'description',
        value: value.toLowerCase()
      })
    } else {
      filterProps.unsetFilter({ attr: 'description' })
    }
  }

  onClearClick = () => {
    this.props.filterProps.unsetFilter({ attr: 'description' })
  }

  render() {
    const {
      classes,
      account,
      handleNew,
      selectedTransactions,
      filterProps
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
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Search description or categories..."
                onChange={this.onChangeSearch}
                value={filterProps.filters.description || ''}
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput
                }}

              />
              {('description' in this.props.filterProps.filters) && (
                <IconButton
                  className={classes.clearIcon}
                  aria-label="Clear"
                  size="small"
                  onClick={this.onClearClick}
                >
                  <CancelIcon fontSize="inherit" />
                </IconButton>
              )}
            </div>
            <Tooltip title="Import transaction">
              <IconButton
                aria-label="Import transaction"
                component={LinkTo(`/accounts/${account.id}/import`)}
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
  resetSelection: PropTypes.func.isRequired,
  filterProps: PropTypes.object.isRequired
}

export default withStyles(styles)(withRouter(TransactionsToolbarComponent))
