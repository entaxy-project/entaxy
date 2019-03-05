import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import TableToolbar from '../../../common/TableToolbar'

const styles = {
  chekbox: {
    width: 200
  }
}

export class ResultsToolbarComponent extends React.Component {
  onChange = ({ target }) => {
    if (target.checked) {
      this.props.filterProps.setFilter({
        attr: 'errors',
        value: true
      })
    } else {
      this.props.filterProps.unsetFilter({ attr: 'errors' })
    }
  }

  render() {
    const {
      classes,
      title,
      subTitle,
      selectedTransactions
    } = this.props
    return (
      <TableToolbar
        title={title}
        subTitle={subTitle}
        selectedItems={selectedTransactions}
      >
        <FormControlLabel
          label="Show only errors"
          className={classes.chekbox}
          control={(
            <Switch
              checked={Object.keys(this.props.filterProps.filters).includes('errors')}
              onChange={this.onChange}
              value="showOnlyErrors"
            />
          )}
        />
      </TableToolbar>
    )
  }
}

ResultsToolbarComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.node.isRequired,
  selectedTransactions: PropTypes.array.isRequired,
  filterProps: PropTypes.object.isRequired
}

export default withStyles(styles)(ResultsToolbarComponent)
