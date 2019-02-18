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

export class ResultsToolbar extends React.Component {
  state = {
    showOnlyErrors: false
  }

  onChange = ({ target }) => {
    if (target.checked) {
      this.props.filterProps.setFilter({
        attr: 'errors',
        value: transaction => transaction.error !== undefined
      })
    } else {
      this.props.filterProps.unsetFilter({ attr: 'errors' })
    }
    this.setState({
      showOnlyErrors: target.checked
    })
  }

  showOnlyErrors = () => (
    Object.keys[this.props.filterProps.filters].include('showOnlyErrors')
  )

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
          control={
            <Switch
              checked={this.state.showOnlyErrors}
              onChange={this.onChange}
              value="showOnlyErrors"
            />
          }
        />
      </TableToolbar>
    )
  }
}

ResultsToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.node.isRequired,
  selectedTransactions: PropTypes.array.isRequired,
  filterProps: PropTypes.object.isRequired
}

export default withStyles(styles)(ResultsToolbar)
