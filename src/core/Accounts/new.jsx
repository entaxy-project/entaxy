import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import AccountForm from './form'
import { createAccount } from '../../store/accounts/actions'

const mapDispatchToProps = {
  handleSave: account => createAccount(account)
}

export class NewAccountComponent extends React.Component {
  onSave = async (account) => {
    const accountId = await this.props.handleSave(account)
    this.props.history.push(`/accounts/${accountId}/transactions`)
  }

  onCancel = () => {
    this.props.history.push('/dashboard')
  }

  render() {
    return (
      <AccountForm handleSave={this.onSave} handleCancel={this.onCancel} />
    )
  }
}

NewAccountComponent.propTypes = {
  history: PropTypes.object.isRequired,
  handleSave: PropTypes.func.isRequired
}

export default connect(null, mapDispatchToProps)(NewAccountComponent)
