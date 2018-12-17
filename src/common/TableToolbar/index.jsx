import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete'
import { withStyles } from '@material-ui/core/styles'
import { lighten } from '@material-ui/core/styles/colorManipulator'

const styles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
    paddingLeft: '8px',
    margin: '10px'
  },
  highlight: {
    color: theme.palette.secondary.main,
    backgroundColor: lighten(theme.palette.secondary.light, 0.85)
  },
  spacer: {
    flex: '1 1 100%'
  },
  actions: {
    color: theme.palette.text.secondary
  },
  buttons: {
    display: 'flex'
  },
  title: {
    flex: '0 0 auto'
  }
})

const TableToolbar = ({
  title,
  selectedItems,
  classes,
  onDelete,
  children
}) => (
  <Toolbar
    className={classNames(classes.root, {
      [classes.highlight]: selectedItems.length > 0
    })}
  >
    <div className={classes.title}>
      {selectedItems.length > 0 ? (
        <Typography color="inherit" variant="subtitle1">
          {selectedItems.length} selected
        </Typography>
      ) : (
        <Typography variant="h6" id="tableTitle">
          {title}
        </Typography>
      )}
    </div>
    <div className={classes.spacer} />
    <div className={classes.actions}>
      {selectedItems.length > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="Delete" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <div className={classes.buttons}>
          {children}
        </div>
      )}
    </div>
  </Toolbar>
)

TableToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  selectedItems: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  children: PropTypes.object.isRequired
}

export default withStyles(styles)(TableToolbar)
