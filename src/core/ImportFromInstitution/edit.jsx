import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import ImportFromInstitutionForm from './form'
import { updateAccountGroup, deleteAccountGroup } from '../../store/accounts/actions'
import confirm from '../../util/confirm'

const mapDispatchToProps = dispatch => ({
  handleSave: (institution, accountGroup, accounts) => (
    dispatch(updateAccountGroup(institution, accountGroup, accounts))
  ),
  handleDelete: accountGroup => dispatch(deleteAccountGroup(accountGroup))
})

export class EditImportFromInstitutionComponent extends React.Component {
  onSave = async (accountGroup, accounts) => {
    const { institution } = this.props.match.params
    await this.props.handleSave(institution, accountGroup, accounts)
    this.props.history.push('/dashboard')
  }

  onDelete = (accountGroup) => {
    const { accountIds } = accountGroup
    const { institution } = this.props.match.params
    confirm(`Delete all the ${accountIds.length} accounts connected to ${institution}?`, 'Are you sure?')
      .then(async () => {
        await this.props.handleDelete(accountGroup)
        this.props.history.push('/dashboard')
      })
  }

  onCancel = () => {
    this.props.history.push('/dashboard')
  }

  render() {
    const { institution, groupId } = this.props.match.params
    return (
      <ImportFromInstitutionForm
        groupId={groupId}
        handleSave={this.onSave}
        handleCancel={this.onCancel}
        handleDelete={this.onDelete}
        institution={institution}
      />
    )
  }
}

EditImportFromInstitutionComponent.propTypes = {
  history: PropTypes.object.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired
}

export default connect(null, mapDispatchToProps)(EditImportFromInstitutionComponent)
