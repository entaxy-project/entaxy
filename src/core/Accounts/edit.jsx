import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import AccountForm from './form'
import { updateAccount, deleteAccount } from '../../store/accounts/actions'
import confirm from '../../util/confirm'

const mapDispatchToProps = {
  handleUpdate: account => updateAccount(account),
  handleDelete: account => deleteAccount(account)
}

export class EditAccountComponent extends React.Component {
  onSave = async (account) => {
    await this.props.handleUpdate(account)
    this.props.history.push(`/accounts/${account.id}/transactions`)
  }

  onDelete = (account) => {
    confirm('Delete selected account?', 'Are you sure?').then(async () => {
      await this.props.handleDelete(account)
      this.props.history.push('/dashboard')
    })
  }

  onCancel = () => {
    this.props.history.push(`/accounts/${this.props.match.params.accountId}/transactions`)
  }

  render() {
    return (
      <AccountForm
        accountId={this.props.match.params.accountId}
        handleSave={this.onSave}
        handleDelete={this.onDelete}
        handleCancel={this.onCancel}
      />
    )
  }
}

EditAccountComponent.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired
}

export default connect(null, mapDispatchToProps)(withRouter(EditAccountComponent))
