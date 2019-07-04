import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
// import PropTypes from 'prop-types'
// import IconButton from '@material-ui/core/IconButton'
// import EditIcon from '@material-ui/icons/Edit'
// import Tooltip from '@material-ui/core/Tooltip'
import { FixedSizeList as List } from 'react-window'

const styles = {
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: 'calc(100vh - 170px)'
  },
  tableButton: {
    padding: 4
  },
  smallIcon: {
    fontSize: 18
  }
}

const mapStateToProps = state => ({
  settings: state.settings
})

// const mapDispatchToProps = dispatch => ({
//   deleteTransactions: (account, transactionIds) => dispatch(deleteTransactions(account, transactionIds))
// })


export class BudgetCategoriesComponent extends React.Component {
  renderRow = ({ index, style }) => (
    <div style={style}>
      Row
      {index}
    </div>
  )

  handleSave = () => {

  }

  isSelected = id => this.state.selected.indexOf(id) !== -1

  render() {
    // const {
    //   classes,
    //   settings
    // } = this.props
    return (
      <List
        height={150}
        itemCount={1000}
        itemSize={35}
        width={300}
      >
        {this.renderRow}
      </List>
    )
  }
}

// BudgetCategoriesComponent.propTypes = {
//   classes: PropTypes.object.isRequired,
//   settings: PropTypes.array.isRequired
// }

export default compose(
  connect(mapStateToProps),
  withStyles(styles)
)(BudgetCategoriesComponent)
