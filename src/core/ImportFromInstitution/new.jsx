/* eslint-disable no-console */
import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import ImportFromInstitutionForm from './form'
import { createAccountGroup } from '../../store/accounts/actions'

const mapDispatchToProps = {
  handleSave: (institution, institutionGroup, accounts) =>
    createAccountGroup(institution, institutionGroup, accounts)
}

export class NewImportFromInstitutionComponent extends React.Component {
  onSave = async (institutionGroup, accounts) => {
    const { institution } = this.props.match.params
    await this.props.handleSave(institution, institutionGroup, accounts)
    this.props.history.push('/dashboard')
  }

  onCancel = () => {
    this.props.history.push('/dashboard')
  }

  render() {
    const { institution } = this.props.match.params
    return (
      <ImportFromInstitutionForm
        handleSave={this.onSave}
        handleCancel={this.onCancel}
        institution={institution}
      />
    )
  }
}

NewImportFromInstitutionComponent.propTypes = {
  history: PropTypes.object.isRequired,
  handleSave: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired
}

export default connect(null, mapDispatchToProps)(NewImportFromInstitutionComponent)
