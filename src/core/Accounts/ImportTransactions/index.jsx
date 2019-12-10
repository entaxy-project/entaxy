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
import InstitutionIcon from '../../../common/InstitutionIcon'
import { addTransactions, getAccountTransactions } from '../../../store/transactions/actions'
import { showSnackbar } from '../../../store/user/actions'
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
    color: `${theme.palette.success.background} !important`
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
  const { account, transactions, budgetRules } = useSelector((state) => ({
    account: state.accounts.byId[match.params.accountId],
    transactions: dispatch(getAccountTransactions(match.params.accountId)),
    budgetRules: state.budget.rules
  }))

  const [activeStep, setActiveStep] = useState(0)
  const [isGeneratingTransactions, setIsGeneratingTransactions] = useState(false)
  const [parser, setParser] = useState(new CsvParser({ budgetRules }))

  const handleNext = () => {
    setActiveStep((currentStep) => currentStep + 1)
  }

  const handlePrev = () => {
    if (activeStep === 1) {
      setActiveStep(0)
      setParser(new CsvParser({ budgetRules }))
    } else {
      setActiveStep((currentStep) => currentStep - 1)
    }
  }

  const setDuplicateTransactions = () => (
    parser.transactions.forEach((newTransaction, index) => {
      if (newTransaction.errors.length === 0) {
        const duplicate = transactions.find((transaction) => {
          // Note: transactions only have date (no time) associated so they are save them d 1 second
          // ahead so thart the opening balance is always the first transactions of the day
          return transaction.createdAt === newTransaction.createdAt + 1000
            && transaction.description === newTransaction.description
            && transaction.amount.accountCurrency === newTransaction.amount.accountCurrency
        })
        if (duplicate !== undefined) {
          parser.transactions[index].duplicate = duplicate
        }
      }
    })
  )

  const handleGenerateTransactions = (event, { moveToNextStep = true } = {}) => {
    event.preventDefault()
    setIsGeneratingTransactions(true)
    parser.mapToTransactions()
    setDuplicateTransactions()
    setIsGeneratingTransactions(false)
    if (moveToNextStep) handleNext()
  }

  const handleSaveTransactions = async () => {
    const newTransactions = parser.transactions
      .filter((transaction) => (
        transaction.errors.length === 0 && transaction.duplicate === undefined
      ))
      .map((transaction) => ({
        amount: transaction.amount,
        description: transaction.description,
        categoryId: transaction.categoryId,
        createdAt: transaction.createdAt
      }))
    if (newTransactions.length > 0) {
      await dispatch(addTransactions(account, newTransactions))
      dispatch(showSnackbar({
        text: `${pluralize('transaction', newTransactions.length, true)} imported`,
        status: 'success'
      }))
    }
    history.push(`/accounts/${account.id}/transactions`)
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
                switch (index) {
                  case 0:
                    if (parser.file) {
                      optionalText = parser.file.name
                    }
                    break
                  case 1:
                    if (parser.file) {
                      optionalText = `Read ${pluralize('lines', parser.csvData.length, true)} from CSV`
                    }
                    break
                  case 2:
                    if (activeStep >= index) {
                      optionalText = `Loaded ${parser.transactions.length} transactions`
                    }
                    break
                  // no default
                }
                return (
                  <Step key={step}>
                    <StepLabel
                      optional={<small>{optionalText}</small>}
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
                handleNextStep={handleGenerateTransactions}
                isGeneratingTransactions={isGeneratingTransactions}
                parser={parser}
              />
            )}
            {activeStep === 2 && (
              <ImportedTransactions
                account={account}
                handlePrevStep={handlePrev}
                handleNextStep={handleSaveTransactions}
                handleGenerateTransactions={handleGenerateTransactions}
                isGeneratingTransactions={isGeneratingTransactions}
                parser={parser}
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
