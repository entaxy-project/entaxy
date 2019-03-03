import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import * as Yup from 'yup'
import Typography from '@material-ui/core/Typography'
import DescriptionCard from '../../common/DescriptionCard'

export const initialValues = institution => ({
  Coinbase: {
    apiKey: '',
    apiSecret: ''
  },
  Questrade: {
    refreshToken: ''
  }
}[institution])

export const validationScheme = institution => ({
  Coinbase: (
    Yup.object().shape({
      apiKey: Yup.string()
        .max(100, 'Too Long!')
        .required('Please enter the API key'),
      apiSecret: Yup.string()
        .max(100, 'Too Long!')
        .required('Please enter the API secret')
    })
  ),
  Questrade: (
    Yup.object().shape({
      refreshToken: Yup.string()
        .max(100, 'Too Long!')
        .required('Please enter the refresh token')
    })
  )
}[institution])

export const instructionsFor = institution => ({
  Coinbase: (
    <div>
      <Typography variant="caption" paragraph>
        <a href="https://www.coinbase.com/settings/api" target="_blank" rel="noopener noreferrer">
          <Typography variant="caption" color="secondary">
            Create an API key on Coinbase (opens in a new tab)
          </Typography>
        </a>
      </Typography>
      <DescriptionCard info>
        <Typography variant="caption">
          Make sure your api key has access to <strong>all accounts</strong> and has
          the following permimisions:
          <ul>
            <li><strong>wallet:accounts:read</strong></li>
            <li><strong>wallet:transactions:read</strong></li>
          </ul>
        </Typography>
      </DescriptionCard>
    </div>
  ),
  Questrade: (
    <div>test</div>
  )
}[institution])

export class FormFieldsComponent extends React.Component {
  render() {
    const {
      institution,
      formClassName,
      inputClassName,
      values,
      handleChange,
      errors,
      touched
    } = this.props
    return {
      Coinbase: (
        <span className={formClassName}>
          <TextField
            className={inputClassName}
            label="API key"
            inputProps={{
              'aria-label': 'API key',
              maxLength: 100
            }}
            value={values.apiKey}
            name="apiKey"
            onChange={handleChange}
            error={errors.apiKey && touched.apiKey}
            helperText={errors.apiKey}
          />
          <TextField
            className={inputClassName}
            label="API secret"
            inputProps={{
              'aria-label': 'API secret',
              maxLength: 100
            }}
            value={values.apiSecret}
            name="apiSecret"
            onChange={handleChange}
            error={errors.apiSecret && touched.apiSecret}
            helperText={errors.apiSecret}
          />
        </span>
      ),
      Questrade: (
        <TextField
          className={inputClassName}
          label="Refresh Token"
          inputProps={{
            'aria-label': 'Refresh Token',
            maxLength: 100
          }}
          value={values.refreshToken}
          name="refreshToken"
          onChange={handleChange}
          error={errors.refreshToken && touched.refreshToken}
          helperText={errors.refreshToken}
        />
      )
    }[institution] || null
  }
}

FormFieldsComponent.propTypes = {
  institution: PropTypes.string.isRequired,
  formClassName: PropTypes.string.isRequired,
  inputClassName: PropTypes.string.isRequired,
  values: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired

}

export default FormFieldsComponent
