import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Tooltip from '@material-ui/core/Tooltip'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import SaveIcon from '@material-ui/icons/Save'
import TableToolbar from '../../../common/TableToolbar'

const useStyles = makeStyles((theme) => ({
  chekbox: {
    width: 220
  },
  smallButton: {
    height: 30,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  submitButton: {
    marginLeft: theme.spacing(2)
  },
  saveIcon: {
    marginRight: theme.spacing(1),
    fontSize: 18
  }
}))

const ResultsToolbar = ({
  title,
  subTitle,
  filterProps,
  handleNextStep,
  handlePrevStep,
  invertAmount,
  handleChangeInvertAmount,
  isGeneratingTransactions
}) => {
  const classes = useStyles()
  const [checked, setChecked] = useState({ showOnlyErrors: false, showOnlyDuplicates: false })

  const onChange = ({ target }) => {
    const attr = target.value === 'showOnlyErrors' ? 'errors' : 'duplicates'
    if (target.checked) {
      filterProps.setFilter({ attr, value: true })
    } else {
      filterProps.unsetFilter({ attr })
    }
    setChecked((prevValue) => ({ ...prevValue, [target.value]: target.checked }))
  }

  return (
    <TableToolbar
      title={title}
      subTitle={subTitle}
      selectedItems={[]}
    >
      <FormControlLabel
        label="Show only errors"
        className={classes.chekbox}
        control={(
          <Switch
            checked={checked.showOnlyErrors}
            onChange={onChange}
            value="showOnlyErrors"
            inputProps={{ 'data-testid': 'showOnlyErrors', checked: checked.showOnlyErrors }}
            data-testid="showOnlyErrorsSwitch"
          />
        )}
      />
      <FormControlLabel
        label="Show only duplicates"
        className={classes.chekbox}
        control={(
          <Switch
            checked={checked.showOnlyDuplicates}
            onChange={onChange}
            value="showOnlyDuplicates"
            inputProps={{ 'data-testid': 'showOnlyDuplicates', checked: checked.showOnlyDuplicates }}
            data-testid="showOnlyDuplicatesSwitch"
          />
        )}
      />
      <Tooltip title="Purchases should appear negative under the Out column">
        <FormControlLabel
          className={classes.formField}
          classes={{ label: classes.smallLabel }}
          control={(
            <Checkbox
              checked={invertAmount}
              onChange={handleChangeInvertAmount}
              value="invertAmount"
            />
          )}
          label="Invert amount"
        />
      </Tooltip>

      <Button
        size="small"
        onClick={handlePrevStep}
        className={classes.smallButton}
        data-testid="backButton"
      >
        Back
      </Button>
      <Button
        onClick={handleNextStep}
        type="submit"
        size="small"
        variant="contained"
        color="secondary"
        disabled={isGeneratingTransactions}
        className={[classes.smallButton, classes.submitButton].join(' ')}
        data-testid="saveButton"
      >
        <SaveIcon className={classes.saveIcon} />
        Save
      </Button>
    </TableToolbar>
  )
}

ResultsToolbar.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.node.isRequired,
  filterProps: PropTypes.object.isRequired,
  handleNextStep: PropTypes.func.isRequired,
  handlePrevStep: PropTypes.func.isRequired,
  invertAmount: PropTypes.bool.isRequired,
  handleChangeInvertAmount: PropTypes.func.isRequired,
  isGeneratingTransactions: PropTypes.bool.isRequired
}

ResultsToolbar.defaultProps = {
  title: ''
}

export default ResultsToolbar
