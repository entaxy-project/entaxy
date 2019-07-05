import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { lighten } from '@material-ui/core/styles/colorManipulator'

const styles = theme => ({
  root: {
    paddingRight: theme.spacing(1),
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
  title: {
    flex: '0 0 auto'
  }
})

const TableToolbar = ({
  title,
  subTitle,
  selectedItems,
  classes,
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
          {selectedItems.length}
          &nbsp;selected
        </Typography>
      ) : (
        <div>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="caption">{subTitle}</Typography>
        </div>
      )}
    </div>
    <div className={classes.spacer} />
    <div className={classes.actions}>
      {children}
    </div>
  </Toolbar>
)

TableToolbar.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.node,
  selectedItems: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
  children: PropTypes.node
}

TableToolbar.defaultProps = {
  title: undefined,
  subTitle: undefined,
  children: undefined
}

export default withStyles(styles)(TableToolbar)
