import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import ImportFromInstitutionForm from './form'
import { updateAccountGroup, deleteAccountGroup } from '../../store/accounts/actions'
import confirm from '../../util/confirm'

const mapDispatchToProps = {
  updateAccountGroup: (institution, accountGroup, accounts) => (
    updateAccountGroup(institution, accountGroup, accounts)
  ),
  deleteAccountGroup: accountGroup => deleteAccountGroup(accountGroup)
}

export class EditImportFromInstitutionComponent extends React.Component {
  handleSave = async (accountGroup, accounts) => {
    const { institution } = this.props.match.params
    this.props.updateAccountGroup(institution, accountGroup, accounts)
    this.props.history.push('/dashboard')
  }

  handleDelete = (accountGroup) => {
    const { accountIds } = accountGroup
    const { institution } = this.props.match.params
    confirm(`Delete all the ${accountIds.length} accounts connected to ${institution}?`, 'Are you sure?')
      .then(async () => {
        await this.props.deleteAccountGroup(accountGroup)
        this.props.history.push('/dashboard')
      })
  }

  handleCancel = () => {
    this.props.history.push('/dashboard')
  }

  render() {
    const { institution, groupId } = this.props.match.params
    return (
      <ImportFromInstitutionForm
        groupId={groupId}
        handleSave={this.handleSave}
        handleCancel={this.handleCancel}
        handleDelete={this.handleDelete}
        institution={institution}
      />
    )
  }
}

EditImportFromInstitutionComponent.propTypes = {
  history: PropTypes.object.isRequired,
  updateAccountGroup: PropTypes.func.isRequired,
  deleteAccountGroup: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired
}

export default connect(null, mapDispatchToProps)(EditImportFromInstitutionComponent)
