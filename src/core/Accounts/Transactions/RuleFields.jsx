import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import { RULE_TYPES } from '../../../store/budget/reducer'

const useStyles = makeStyles((theme) => ({
  inlineInput: {
    marginLeft: theme.spacing(2),
    width: '100%'
  },
  inlineSelect: {
    marginRight: theme.spacing(2)
  },
  inlineText: {
    marginRight: theme.spacing(2),
    lineHeight: '42px'
  },
  indented: {
    paddingLeft: theme.spacing(1)
  },
  showExisting: {
    color: theme.palette.info.text,
    paddingTop: 0,
    paddingBottom: 0,
    lineHeight: 'normal',
    textTransform: 'none'
  },
  smallIcon: {
    fontSize: 14
  }
}))

const RuleFields = ({
  transaction,
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  filteredTransactions,
  toggleShowTransactions,
  showTransactions
}) => {
  const classes = useStyles()
  const [oldCheckboxesState, SetOldCheckboxesState] = useState({ applyToExistin: true, applyToFuture: true })

  const handleChangeApplyToOtherTransactions = (_, checked) => {
    if (!checked) {
      SetOldCheckboxesState({
        applyToExisting: values.applyToExisting,
        applyToFuture: values.applyToFuture
      })
      setFieldValue('applyToOtherTransactions', false)
      setFieldValue('applyToExisting', false)
      setFieldValue('applyToFuture', false)
    } else {
      setFieldValue('applyToOtherTransactions', true)
      setFieldValue('applyToExisting', oldCheckboxesState.applyToExisting)
      setFieldValue('applyToFuture', oldCheckboxesState.applyToFuture)
    }
  }

  const handleChangeApplyToExisting = (_, checked) => {
    setFieldValue('applyToExisting', checked)
    if (!checked && !values.applyToFuture) {
      setFieldValue('applyToOtherTransactions', false)
    }
  }

  const handleChangeApplyToFuture = (_, checked) => {
    setFieldValue('applyToFuture', checked)
    if (!values.applyToExisting && !checked) {
      setFieldValue('applyToOtherTransactions', false)
    }
  }

  const ruleAttributeSelected = (
    values.transactionType === 'transfer' && !!values.transferAccountId
  ) || (
    values.transactionType !== 'transfer' && !!values.categoryId
  )

  const ruleIsBeingRemoved = transaction && transaction.ruleId && !ruleAttributeSelected
  const applyLabel = `
    ${ruleIsBeingRemoved ? 'Remove' : 'Apply'} this
    ${values.transactionType === 'transfer' ? 'transfer' : 'category'}
    ${ruleIsBeingRemoved ? 'from' : 'to'}
  `

  const applyToOtherTransactionsIsDisabled = !values.ruleId
    && !ruleAttributeSelected
    && filteredTransactions.length === 0
  const applyToFutureIsDisabled = !values.applyToOtherTransactions || applyToOtherTransactionsIsDisabled
  const filtersAreDisabled = ruleIsBeingRemoved || applyToFutureIsDisabled

  return (
    <div>
      <FormControlLabel
        control={(
          <Checkbox
            checked={values.applyToOtherTransactions}
            onChange={handleChangeApplyToOtherTransactions}
            name="applyToOtherTransactions"
            value={values.applyToOtherTransactions}
            disabled={applyToOtherTransactionsIsDisabled}
          />
        )}
        label={applyLabel}
      />
      <FormGroup row className={classes.indented}>
        <FormControlLabel
          control={(
            <Checkbox
              checked={values.applyToExisting}
              onChange={handleChangeApplyToExisting}
              name="applyToExisting"
              value={values.applyToExisting}
              disabled={filteredTransactions.length === 0}
            />
          )}
          label={(
            <>
              {filteredTransactions.length} other existing transactions&nbsp;
              <Button
                size="small"
                color="secondary"
                className={classes.showExisting}
                onClick={toggleShowTransactions}
                disabled={filteredTransactions.length === 0}
              >
                {showTransactions && (
                  <><ArrowBackIosIcon className={classes.smallIcon} /> Hide</>
                )}
                {!showTransactions && (
                  <>Show <ArrowForwardIosIcon className={classes.smallIcon} /></>
                )}
              </Button>
            </>
          )}
        />
      </FormGroup>
      <FormGroup row className={classes.indented}>
        <FormControlLabel
          control={(
            <Checkbox
              checked={values.applyToFuture}
              onChange={handleChangeApplyToFuture}
              name="applyToFuture"
              value={values.applyToFuture}
              disabled={applyToFutureIsDisabled}
            />
          )}
          label="future transactions"
        />
      </FormGroup>
      <Grid container className={classes.indented}>
        <Grid item xs={5}>
          <Select
            name="ruleType"
            value={values.ruleType}
            onChange={handleChange}
            disabled={filtersAreDisabled}
          >
            {Object.keys(RULE_TYPES).map((type) => (
              <MenuItem value={type} key={type}>
                that {RULE_TYPES[type]}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={7}>
          {values.ruleType === 'equals' && (
            <Box color={filtersAreDisabled ? 'text.disabled' : null}>
              <Typography className={classes.inlineText}>the same description</Typography>
            </Box>
          )}
          {values.ruleType !== 'equals' && (
            <TextField
              name="filterText"
              value={values.filterText}
              disabled={filtersAreDisabled}
              onChange={handleChange}
              error={errors.filterText && touched.filterText}
              helperText={errors.filterText}
            />
          )}
        </Grid>
      </Grid>
      <FormControlLabel
        className={classes.indented}
        control={(
          <Checkbox
            checked={values.matchAmount}
            onChange={handleChange}
            name="matchAmount"
            value={values.matchAmount}
            disabled={filtersAreDisabled}
          />
        )}
        label="and match the same amount"
      />
    </div>
  )
}

RuleFields.propTypes = {
  transaction: PropTypes.object,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  filteredTransactions: PropTypes.array.isRequired,
  toggleShowTransactions: PropTypes.func.isRequired,
  showTransactions: PropTypes.bool.isRequired
}

RuleFields.defaultProps = {
  transaction: null
}

export default RuleFields
