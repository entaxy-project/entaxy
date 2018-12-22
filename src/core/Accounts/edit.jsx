import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import AccountForm from './form'
import { updateAccount, deleteAccount } from '../../store/accounts/actions'
import confirm from '../../util/confirm'

const mapDispatchToProps = {
  handleSave: account => updateAccount(account),
  handleDelete: account => deleteAccount(account)
}

const EditAccount = ({
  history,
  match,
  handleSave,
  handleDelete
}) => {
  const onSave = (account) => {
    handleSave(account)
    history.push(`/accounts/${account.id}/transactions`)
  }

  const onDelete = () => {
    confirm('Delete selected account?', 'Are you sure?').then(() => {
      handleDelete(match.params.accountId)
      history.push('/dashboard')
    })
  }

  const onCancel = () => {
    history.push(`/accounts/${match.params.accountId}/transactions`)
  }

  return (
    <AccountForm
      accountId={match.params.accountId}
      handleSave={onSave}
      handleDelete={onDelete}
      handleCancel={onCancel}
    />
  )
}

EditAccount.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired
}

export default connect(null, mapDispatchToProps)(withRouter(EditAccount))
