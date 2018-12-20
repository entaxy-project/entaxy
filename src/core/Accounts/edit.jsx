import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import AccountForm from './form'
import { updateAccount } from '../../store/accounts/actions'

const mapDispatchToProps = {
  handleSave: account => updateAccount(account)
}

const EditAccount = ({ history, match, handleSave }) => {
  const onSave = (account) => {
    handleSave(account)
    history.push(`/accounts/${account.id}/transactions`)
  }

  const onCancel = () => {
    history.push(`/accounts/${match.params.accountId.id}/transactions`)
  }

  return (
    <AccountForm accountId={match.params.accountId} handleSave={onSave} handleCancel={onCancel} />
  )
}

EditAccount.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  handleSave: PropTypes.func.isRequired
}

export default connect(null, mapDispatchToProps)(EditAccount)
