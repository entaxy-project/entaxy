import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import TableToolbar from '../../../common/TableToolbar'

const useStyles = makeStyles((theme) => ({
  chekbox: {
    width: 200
  },
  smallButton: {
    height: 30
  },
  submitButton: {
    marginLeft: theme.spacing(2)
  }
}))

const ResultsToolbar = ({
  title,
  subTitle,
  selectedTransactions,
  filterProps,
  onSave,
  handlePrevStep
}) => {
  const classes = useStyles()
  const [checked, setChecked] = useState(false)

  const onChange = ({ target }) => {
    if (target.checked) {
      filterProps.setFilter({
        attr: 'errors',
        value: true
      })
    } else {
      filterProps.unsetFilter({ attr: 'errors' })
    }
    setChecked(target.checked)
  }

  return (
    <TableToolbar
      title={title}
      subTitle={subTitle}
      selectedItems={selectedTransactions}
    >
      <FormControlLabel
        label="Show only errors"
        className={classes.chekbox}
        control={(
          <Switch
            checked={checked}
            onChange={onChange}
            value="showOnlyErrors"
            inputProps={{ 'data-testid': 'showOnlyErrors', checked }}
            data-testid="showOnlyErrorsSwitch"
          />
        )}
      />
      <Button
        size="small"
        onClick={handlePrevStep}
        className={classes.smallButton}
        data-testid="backButton"
      >
        Back
      </Button>
      <Button
        onClick={onSave}
        type="submit"
        size="small"
        variant="contained"
        color="secondary"
        className={[classes.smallButton, classes.submitButton].join(' ')}
        data-testid="saveButton"
      >
        Save
      </Button>
    </TableToolbar>
  )
}

ResultsToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.node.isRequired,
  selectedTransactions: PropTypes.array.isRequired,
  filterProps: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  handlePrevStep: PropTypes.func.isRequired
}

export default ResultsToolbar
