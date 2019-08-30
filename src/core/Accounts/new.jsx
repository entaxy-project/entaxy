import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import AccountForm from './form'
import { createAccount } from '../../store/accounts/actions'

const mapDispatchToProps = {
  createAccount: (account) => createAccount(account)
}

export class NewAccountComponent extends React.Component {
  handleSave = async (account) => {
    const accountId = await this.props.createAccount(account)
    this.props.history.push(`/accounts/${accountId}/transactions`)
  }

  handleCancel = () => {
    this.props.history.push('/dashboard')
  }

  render() {
    return (
      <AccountForm handleSave={this.handleSave} handleCancel={this.handleCancel} />
    )
  }
}

NewAccountComponent.propTypes = {
  history: PropTypes.object.isRequired,
  createAccount: PropTypes.func.isRequired
}

export default connect(null, mapDispatchToProps)(NewAccountComponent)
