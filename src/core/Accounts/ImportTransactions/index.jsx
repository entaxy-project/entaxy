import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import uuid from 'uuid/v4'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import InstitutionIcon from '../../../common/InstitutionIcon'
import { addTransactions } from '../../../store/transactions/actions'
import institutions from '../../../data/institutions'
import CsvImportForm from './CsvImportForm'
import ImportedResults from './ImportedResults'

const styles = theme => ({
  root: {
    margin: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2,
    width: '100%'
  },
  importHeader: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

const mapStateToProps = ({ accounts }, props) => ({
  account: accounts.byId[props.match.params.accountId]
})

const mapDispatchToProps = dispatch => ({
  saveTransactions: (account, transactions) => dispatch(addTransactions(account, transactions))
})

const initialState = {
  importType: 'CSV',
  showTransactions: false,
  transactions: [],
  errors: {}
}

export class ImportTransactionsComponent extends React.Component {
  state = initialState

  handleSave = () => {
    const { saveTransactions, account, history } = this.props
    const transactions = this.state.transactions
      .filter(transaction => transaction.errors.length === 0)
      .map(transaction => ({
        amount: transaction.amount,
        description: transaction.description,
        createdAt: transaction.createdAt
      }))
    saveTransactions(account, transactions)
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
      account
    } = this.props
    return (
      <Grid container direction="row" justify="center">
        <Paper className={classes.root}>
          <div className={classes.importHeader}>
            <Typography variant="h6" align="center">
              Import transactions from {account.institution}
            </Typography>
            <Typography>
              <InstitutionIcon institution={account.institution} size="small" />
            </Typography>
          </div>
          <Divider />
          <Grid container>
            <Grid item xs={3} >
              <List>
                {institutions[account.institution].importTypes.map(text => (
                  <ListItem button key={text} selected={true}>
                    <ListItemText primary={text} />
                  </ListItem>
                ))}
                <ListItem button key="Microsoft Money" disabled={true}>
                  <ListItemText primary="Microsoft Money" />
                </ListItem>
                <ListItem button key="Intuit Quicken" disabled={true}>
                  <ListItemText primary="Intuit Quicken" />
                </ListItem>
                <ListItem button key="Intuit QuickBooks" disabled={true}>
                  <ListItemText primary="Intuit QuickBooks" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={9} >
              {!showTransactions && importType === 'CSV' &&
                <CsvImportForm
                  account={account}
                  handleParsedData={this.handleParsedData}
                  onCancel={this.handleCancel}
                />
              }
              {showTransactions &&
                <ImportedResults
                  account={account}
                  transactions={transactions}
                  errors={errors}
                  onSave={this.handleSave}
                  onBack={this.handleBack}
                />
              }
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
  history: PropTypes.object.isRequired,
  saveTransactions: PropTypes.func.isRequired
}

export default withRouter(compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(ImportTransactionsComponent))
