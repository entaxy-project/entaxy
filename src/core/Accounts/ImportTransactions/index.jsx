import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import uuid from 'uuid/v4'
import pluralize from 'pluralize'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import InstitutionIcon from '../../../common/InstitutionIcon'
import { addTransactions } from '../../../store/transactions/actions'
import { showSnackbar } from '../../../store/settings/actions'
import CsvImportForm from './CsvImportForm'
import ImportedResults from './ImportedResults'

const styles = theme => ({
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
  }
})

const mapStateToProps = ({ accounts, budget }, props) => ({
  account: accounts.byId[props.match.params.accountId],
  budgetRules: budget.rules
})

const mapDispatchToProps = dispatch => ({
  saveTransactions: (account, transactions) => dispatch(addTransactions(account, transactions)),
  showSnackbarMessage: message => dispatch(showSnackbar(message))
})

const initialState = {
  importType: 'CSV',
  showTransactions: false,
  transactions: [],
  errors: {}
}

export class ImportTransactionsComponent extends React.Component {
  state = initialState

  handleSave = async () => {
    const {
      saveTransactions,
      showSnackbarMessage,
      account,
      history
    } = this.props
    const transactions = this.state.transactions
      .filter(transaction => transaction.errors.length === 0)
      .map(transaction => ({
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
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

  handleCancel = () => {
    this.props.history.push(`/accounts/${this.props.account.id}/transactions`)
  }

  handleBack = () => {
    return this.setState({ showTransactions: false })
  }


  handleParsedData = (transactions, errors) => {
    return this.setState({
      showTransactions: true,
      transactions: transactions.map(t => Object.assign(t, { id: uuid() })),
      errors
    })
  }

  render() {
    const {
      showTransactions,
      transactions,
      errors,
      importType
    } = this.state
    const {
      classes,
      account,
      budgetRules
    } = this.props
    return (
      <Grid container direction="row" justify="center">
        <Paper className={classes.root}>
          <div className={classes.importHeader}>
            <Typography variant="h6" align="center">
              Import transactions from
              {account.institution}
            </Typography>
            <Typography>
              <InstitutionIcon institution={account.institution} size="small" />
            </Typography>
          </div>
          <Divider />
          <Grid container>
            <Grid item xs={3}>
              <List>
                {['CSV', 'Microsoft Money', 'Intuit Quicken', 'Intuit QuickBooks'].map((text, index) => (
                  <ListItem button key={text} selected={index === 0}>
                    <ListItemText primary={text} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={9}>
              {!showTransactions && importType === 'CSV' && (
                <CsvImportForm
                  account={account}
                  budgetRules={budgetRules}
                  handleParsedData={this.handleParsedData}
                  onCancel={this.handleCancel}
                />
              )}
              {showTransactions && (
                <ImportedResults
                  account={account}
                  transactions={transactions}
                  errors={errors}
                  onSave={this.handleSave}
                  onBack={this.handleBack}
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
