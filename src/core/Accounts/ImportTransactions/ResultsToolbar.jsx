import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import TableToolbar from '../../../common/TableToolbar'

const styles = () => ({
  chekbox: {
    width: 200
  }
})

const ResultsToolbar = ({
  classes,
  title,
  subTitle,
  selectedTransactions,
  onFilter,
  showOnlyErrors
}) => (
  <TableToolbar
    title={title}
    subTitle={subTitle}
    selectedItems={selectedTransactions}
  >
    {onFilter &&
      <FormControlLabel
        label="Show only errors"
        className={classes.chekbox}
        control={
          <Switch
            checked={showOnlyErrors}
            onChange={onFilter}
            value="showOnlyErrors"
          />
        }
      />
    }
  </TableToolbar>
)

ResultsToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.node.isRequired,
  selectedTransactions: PropTypes.array.isRequired,
  onFilter: PropTypes.func,
  showOnlyErrors: PropTypes.bool
}

ResultsToolbar.defaultProps = {
  onFilter: undefined,
  showOnlyErrors: false
}

export default withStyles(styles)(ResultsToolbar)
