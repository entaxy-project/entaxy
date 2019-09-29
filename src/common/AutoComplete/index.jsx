import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'
import CreatableSelect from 'react-select/creatable'
import Typography from '@material-ui/core/Typography'
import FormHelperText from '@material-ui/core/FormHelperText'

const AutoComplete = ({
  async,
  creatable,
  label,
  options,
  loadOptions,
  onChange,
  error,
  helperText,
  className,
  ...rest
}) => {
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
          defaultValue={rest.value}
          options={options}
          onChange={(selection) => onChange(rest.name, selection)}
          {...rest}
        />
      )}
      { !async && creatable && (
        <CreatableSelect
          defaultValue={rest.value}
          options={options}
          onChange={(selection) => onChange(rest.name, selection)}
          {...rest}
        />
      )}
      { async && (
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          onChange={(selection) => onChange(rest.name, selection)}
          {...rest}
        />
      )}
      {error && (
        <FormHelperText error>
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
  options: undefined,
  loadOptions: undefined,
  className: undefined,
  styles: undefined,
  error: undefined,
  helperText: undefined
}

export default AutoComplete
