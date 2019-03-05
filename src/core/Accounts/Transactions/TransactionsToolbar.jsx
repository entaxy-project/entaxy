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
import InputBase from '@material-ui/core/InputBase'
import SearchIcon from '@material-ui/icons/Search'
import { fade } from '@material-ui/core/styles/colorManipulator'
import confirm from '../../../util/confirm'
import TableToolbar from '../../../common/TableToolbar'

const styles = theme => ({
  importButton: {
    fill: theme.palette.text.secondary
  },
  buttons: {
    display: 'flex'
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.grey[400], 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.grey[400], 0.25)
    },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%'
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    color: 'inherit',
    width: '100%'
  },
  inputInput: {
    paddingTop: theme.spacing.unit * 1.8,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 8,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200
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
                placeholder="Search…"
                onChange={this.onChangeSearch}
                value={filterProps.filters.description || ''}
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput
                }}
              />
            </div>
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
  resetSelection: PropTypes.func.isRequired,
  filterProps: PropTypes.object.isRequired
}

export default withStyles(styles)(withRouter(TransactionsToolbarComponent))
