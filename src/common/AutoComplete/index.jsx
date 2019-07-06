import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'
import CreatableSelect from 'react-select/creatable'
import Typography from '@material-ui/core/Typography'
import FormHelperText from '@material-ui/core/FormHelperText'

const styles = theme => ({
  input: {
    margin: theme.spacing(2),
    width: 320
  },
  inputTitle: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: -theme.spacing(2)
  },
  inputError: {
    marginTop: -theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
})

const AutoComplete = ({
  async,
  creatable,
  label,
  name,
  value,
  options,
  loadOptions,
  onChange,
  error,
  helperText,
  className,
  classes
}) => (
  <div>
    <Typography
      variant="subtitle2"
      className={classes.inputTitle}
      color={error ? 'error' : 'initial'}
    >
      {label}
    </Typography>
    { !async && !creatable && (
      <Select
        placeholder={label}
        name={name}
        value={value}
        defaultValue={value}
        options={options}
        inputProps={{ 'aria-label': label, required: true }}
        onChange={selection => onChange(name, selection)}
        isClearable
        className={className}
      />
    )}
    { !async && creatable && (
      <CreatableSelect
        placeholder={label}
        name={name}
        value={value}
        defaultValue={value}
        options={options}
        inputProps={{ 'aria-label': label, required: true }}
        onChange={selection => onChange(name, selection)}
        isClearable
        className={className}
      />
    )}
    { async && (
      <AsyncSelect
        placeholder={label}
        name={name}
        value={value}
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        inputProps={{ 'aria-label': label }}
        onChange={selection => onChange(name, selection)}
        isClearable
        className={className}
      />
    )}
    {error && (
      <FormHelperText error className={classes.inputError}>
        {helperText}
      </FormHelperText>
    )}
  </div>
)

AutoComplete.propTypes = {
  async: PropTypes.bool,
  creatable: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.object,
  options: PropTypes.array,
  loadOptions: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string
}

AutoComplete.defaultProps = {
  async: false,
  creatable: false,
  value: null,
  options: undefined,
  loadOptions: undefined,
  className: undefined,
  error: undefined,
  helperText: undefined
}

export default withStyles(styles)(AutoComplete)
