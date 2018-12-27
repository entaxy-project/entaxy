import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'
import green from '@material-ui/core/colors/green'
import CsvDropzone from './CsvDropzone'
import RbcCsvParser from '../../../store/transactions/CsvParsers/RbcCsvParser'
import BmoCsvParser from '../../../store/transactions/CsvParsers/BmoCsvParser'
import TdCsvParser from '../../../store/transactions/CsvParsers/TdCsvParser'
import TangerineCsvParser from '../../../store/transactions/CsvParsers/TangerineCsvParser'

const styles = theme => ({
  root: {
    display: 'flex',
    'justify-content': 'center'
  },
  input: {
    margin: '5px',
    width: 200
  },
  formActions: {
    display: 'flex',
    'justify-content': 'flex-end',
    'padding-top': '10px'
  },
  buttonWrapper: {
    margin: theme.spacing.unit,
    position: 'relative'
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700]
    }
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
})

const parsers = {
  RBC: RbcCsvParser,
  BMO: BmoCsvParser,
  TD: TdCsvParser,
  Tangerine: TangerineCsvParser
}

class CsvImportForm extends React.Component {
  state = {
    isSubmitting: false,
    file: null,
    error: null
  }

  setSubmitting = (value) => {
    this.setState({ isSubmitting: value })
  }

  handleFileUpload = (acceptedFiles) => {
    this.setState({
      file: acceptedFiles[0],
      error: (acceptedFiles[0].type === 'text/csv' ? null : 'The file you uploaded is not a CSV file')
    })
  }

  handleSubmit = (event) => {
    const { account, handleParsedData } = this.props
    new parsers[account.institution]().parse(this.state.file, account)
      .then(({ transactions, errors }) => {
        this.setSubmitting(false)
        handleParsedData(transactions, errors)
      })
    event.preventDefault()
  }

  render() {
    const {
      classes,
      onCancel,
      account
    } = this.props

    const {
      file,
      error,
      isSubmitting
    } = this.state

    return (
      <form onSubmit={this.handleSubmit}>
        <div className={classes.root}>
          <CsvDropzone
            className={classes.dropzone}
            handleFileUpload={this.handleFileUpload}
            account={account}
            file={file}
            error={error}
          />
        </div>
        <Divider />
        <div className={classes.formActions}>
          <div className={classes.buttonWrapper}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || file === null || error !== null}
              onClick={this.handleButtonClick}
            >
              Import
            </Button>
            {isSubmitting && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
          <Button onClick={onCancel} color="secondary">Cancel</Button>
        </div>
      </form>
    )
  }
}

CsvImportForm.propTypes = {
  classes: PropTypes.object.isRequired,
  handleParsedData: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired
}

export default withStyles(styles)(CsvImportForm)
