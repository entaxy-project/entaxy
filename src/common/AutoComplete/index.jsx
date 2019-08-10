import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'
import CreatableSelect from 'react-select/creatable'
import Typography from '@material-ui/core/Typography'
import FormHelperText from '@material-ui/core/FormHelperText'

const useStyles = makeStyles(theme => ({

  select: {
    marginTop: -theme.spacing(1)
  },
  inputError: {
    marginTop: -theme.spacing(1),
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}))

const AutoComplete = ({
  async,
  creatable,
  label,
  placeholder,
  name,
  value,
  options,
  loadOptions,
  onChange,
  error,
  helperText,
  className,
  styles
}) => {
  const classes = useStyles()

  return (
    <div className={className}>
      <Typography
        variant="caption"
        color={error ? 'error' : 'textSecondary'}
      >
        {label}
      </Typography>
      { !async && !creatable && (
        <Select
          placeholder={placeholder}
          name={name}
          value={value}
          defaultValue={value}
          options={options}
          inputProps={{ 'aria-label': label, required: true }}
          onChange={selection => onChange(name, selection)}
          isClearable
          styles={styles}
        />
      )}
      { !async && creatable && (
        <CreatableSelect
          placeholder={placeholder}
          name={name}
          value={value}
          defaultValue={value}
          options={options}
          inputProps={{ 'aria-label': label, required: true }}
          onChange={selection => onChange(name, selection)}
          isClearable
          styles={styles}
        />
      )}
      { async && (
        <AsyncSelect
          placeholder={placeholder}
          name={name}
          value={value}
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          inputProps={{ 'aria-label': label }}
          onChange={selection => onChange(name, selection)}
          isClearable
          styles={styles}
        />
      )}
      {error && (
        <FormHelperText error className={classes.inputError}>
          {helperText}
        </FormHelperText>
      )}
    </div>
  )
}

AutoComplete.propTypes = {
  async: PropTypes.bool,
  creatable: PropTypes.bool,
  label: PropTypes.node.isRequired,
  placeholder: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.object,
  options: PropTypes.array,
  loadOptions: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  styles: PropTypes.object,
  className: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string
}

AutoComplete.defaultProps = {
  async: false,
  creatable: false,
  value: null,
  placeholder: undefined,
  options: undefined,
  loadOptions: undefined,
  className: undefined,
  styles: undefined,
  error: undefined,
  helperText: undefined
}

export default AutoComplete
