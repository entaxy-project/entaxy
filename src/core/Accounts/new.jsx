import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import AccountForm from './form'
import { createAccount } from '../../store/accounts/actions'

const mapDispatchToProps = {
  handleSave: account => createAccount(account)
}

const NewAccount = ({ history, handleSave }) => {
  const onSave = (account) => {
    handleSave(account)
    history.push(`/accounts/${account.id}/transactions`)
  }

  const onCancel = () => {
    history.push('/dashboard')
  }

  return (
    <AccountForm handleSave={onSave} handleCancel={onCancel} />
  )
}

NewAccount.propTypes = {
  history: PropTypes.object.isRequired,
  handleSave: PropTypes.func.isRequired
}

export default connect(null, mapDispatchToProps)(NewAccount)
