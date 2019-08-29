import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { compose } from 'recompose'
import { connect } from 'react-redux'
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

const styles = (theme) => ({
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
})

const steps = [
  'Upload CSV file',
  'Select columns to import',
  'Review data'
]

const mapStateToProps = ({ accounts, budget }, props) => ({
  account: accounts.byId[props.match.params.accountId],
  budgetRules: budget.rules
})

const mapDispatchToProps = (dispatch) => ({
  saveTransactions: (account, transactions) => dispatch(addTransactions(account, transactions)),
  showSnackbarMessage: (message) => dispatch(showSnackbar(message))
})


export class ImportTransactionsComponent extends React.Component {
  state = {
    activeStep: 0,
    parser: new CsvParser(this.props.budgetRules)
  }

  handleSave = async () => {
    const {
      saveTransactions,
      showSnackbarMessage,
      account,
      history
    } = this.props
    const transactions = this.state.parser.transactions
      .filter((transaction) => transaction.errors.length === 0)
      .map((transaction) => ({
        amount: transaction.amount,
        description: transaction.description,
        categoryId: transaction.categoryId,
        createdAt: transaction.createdAt
      }))
    if (transactions.length > 0) {
      await saveTransactions(account, transactions)
      showSnackbarMessage({
        text: `${pluralize('transaction', transactions.length, true)} imported`,
        status: 'success'
      })
    }
    history.push(`/accounts/${account.id}/transactions`)
  }

  handleNext = () => {
    this.setState((prevState) => ({ activeStep: prevState.activeStep + 1 }))
  }

  handlePrev = () => {
    if (this.state.activeStep === 1) {
      this.setState({ activeStep: 0, parser: new CsvParser(this.props.budgetRules) })
    } else {
      this.setState((prevState) => ({ activeStep: prevState.activeStep - 1 }))
    }
  }

  render() {
    const {
      parser,
      activeStep
    } = this.state
    const {
      classes,
      account
    } = this.props
    return (
      <Grid container direction="row" justify="center">
        <Paper className={classes.root}>
          <div className={classes.importHeader}>
            <Typography variant="h6" align="center">
              Import transactions from&nbsp;
              {account.institution}
            </Typography>
            <Typography>
              <InstitutionIcon institution={account.institution} size="small" />
            </Typography>
          </div>
          <Divider />
          <Grid container>
            <Grid item xs={12}>
              <Stepper activeStep={activeStep} className={classes.stepper}>
                {steps.map((step, index) => (
                  <Step key={step}>
                    <StepLabel
                      data-testid={activeStep === index ? 'activeStep' : null}
                      StepIconProps={{ classes: { active: classes.activeStep, completed: classes.completedStep } }}
                    >
                      {step}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Grid>
            <Grid item xs={12}>
              {activeStep === 0 && (
                <CsvDropzone
                  handleNextStep={this.handleNext}
                  parser={parser}
                />
              )}
              {activeStep === 1 && (
                <CsvColumnSelection
                  handlePrevStep={this.handlePrev}
                  handleNextStep={this.handleNext}
                  parser={parser}
                />
              )}
              {activeStep === 2 && (
                <ImportedTransactions
                  account={account}
                  parser={parser}
                  handlePrevStep={this.handlePrev}
                  onSave={this.handleSave}
                />
              )}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    )
  }
}

ImportTransactionsComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired,
  budgetRules: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  saveTransactions: PropTypes.func.isRequired,
  showSnackbarMessage: PropTypes.func.isRequired
}

export default withRouter(compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(ImportTransactionsComponent))
