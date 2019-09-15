import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector, useDispatch } from 'react-redux'
import { withRouter } from 'react-router-dom'
import pluralize from 'pluralize'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import green from '@material-ui/core/colors/green'
import InstitutionIcon from '../../../common/InstitutionIcon'
import { addTransactions } from '../../../store/transactions/actions'
import { showSnackbar } from '../../../store/settings/actions'
import CsvDropzone from './CsvDropzone'
import CsvColumnSelection from './CsvColumnSelection'
import ImportedTransactions from './ImportedTransactions'
import CsvParser from '../../../store/transactions/CsvParsers/CsvParser'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    width: '100%'
  },
  importHeader: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  stepper: {
    paddingBottom: 9
  },
  activeStep: {
    color: `${theme.palette.secondary.main} !important`
  },
  completedStep: {
    color: `${green[100]} !important`
  }
}))

const steps = [
  'Upload CSV file',
  'Select columns to import',
  'Review data'
]

export const ImportTransactionsComponent = ({ history, match }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { account, budgetRules } = useSelector(({ accounts, budget }) => ({
    account: accounts.byId[match.params.accountId],
    budgetRules: budget.rules
  }))

  const [activeStep, setActiveStep] = useState(0)
  const [parser, setParser] = useState(new CsvParser({
    budgetRules,
    invertAmount: account.accountType === 'credit'
  }))
  const handleSave = async () => {
    const transactions = parser.transactions
      .filter((transaction) => transaction.errors.length === 0)
      .map((transaction) => ({
        amount: transaction.amount,
        description: transaction.description,
        categoryId: transaction.categoryId,
        createdAt: transaction.createdAt
      }))
    if (transactions.length > 0) {
      await dispatch(addTransactions(account, transactions))
      dispatch(showSnackbar({
        text: `${pluralize('transaction', transactions.length, true)} imported`,
        status: 'success'
      }))
    }
    history.push(`/accounts/${account.id}/transactions`)
  }

  const handleNext = () => {
    setActiveStep((currentStep) => currentStep + 1)
  }

  const handlePrev = () => {
    if (activeStep === 1) {
      setActiveStep(0)
      setParser(new CsvParser({
        budgetRules,
        invertAmount: account.accountType === 'credit'
      }))
    } else {
      setActiveStep((currentStep) => currentStep - 1)
    }
  }

  return (
    <Grid container direction="row" justify="center">
      <Paper className={classes.root}>
        <div className={classes.importHeader}>
          <Typography variant="h6" align="center">
            Import transactions for {account.institution} - {account.name}
          </Typography>
          <Typography>
            <InstitutionIcon institution={account.institution} size="small" />
          </Typography>
        </div>
        <Divider />
        <Grid container>
          <Grid item xs={12}>
            <Stepper activeStep={activeStep} className={classes.stepper}>
              {steps.map((step, index) => {
                let optionalText = null
                if (activeStep > index) {
                  switch (index) {
                    case 0:
                      optionalText = (
                        <>
                          {parser.file.name}
                          <small>{` (${parser.csvData.length} lines)`}</small>
                        </>
                      )
                      break
                    case 1:
                      optionalText = <small>Imported {parser.transactions.length} transactions</small>
                      break
                    // no default
                  }
                }
                return (
                  <Step key={step}>
                    <StepLabel
                      optional={optionalText}
                      data-testid={activeStep === index ? 'activeStep' : null}
                      StepIconProps={{ classes: { active: classes.activeStep, completed: classes.completedStep } }}
                    >
                      {step}
                    </StepLabel>
                  </Step>
                )
              })}
            </Stepper>
          </Grid>
          <Grid item xs={12}>
            {activeStep === 0 && (
              <CsvDropzone
                handleNextStep={handleNext}
                parser={parser}
              />
            )}
            {activeStep === 1 && (
              <CsvColumnSelection
                handlePrevStep={handlePrev}
                handleNextStep={handleNext}
                parser={parser}
              />
            )}
            {activeStep === 2 && (
              <ImportedTransactions
                account={account}
                parser={parser}
                handlePrevStep={handlePrev}
                onSave={handleSave}
              />
            )}
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  )
}

ImportTransactionsComponent.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
}

export default withRouter(ImportTransactionsComponent)
