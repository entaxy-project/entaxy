import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import ImportFromInstitutionForm from './form'
import { createAccountGroup } from '../../store/accounts/actions'

const mapDispatchToProps = {
  createAccountGroup: (institution, accountGroup, accounts) =>
    createAccountGroup(institution, accountGroup, accounts)
}

export class NewImportFromInstitutionComponent extends React.Component {
  handleSave = (accountGroup, accounts) => {
    const { institution } = this.props.match.params
    this.props.createAccountGroup(institution, accountGroup, accounts)
    this.props.history.push('/dashboard')
  }

  handleCancel = () => {
    this.props.history.push('/dashboard')
  }

  render() {
    const { institution } = this.props.match.params
    return (
      <ImportFromInstitutionForm
        handleSave={this.handleSave}
        handleCancel={this.handleCancel}
        institution={institution}
      />
    )
  }
}

NewImportFromInstitutionComponent.propTypes = {
  history: PropTypes.object.isRequired,
  createAccountGroup: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired
}

export default connect(null, mapDispatchToProps)(NewImportFromInstitutionComponent)
