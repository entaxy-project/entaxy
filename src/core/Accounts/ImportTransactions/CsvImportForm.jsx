/* eslint-disable no-console */
import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Typography from '@material-ui/core/Typography'
import Select from '@material-ui/core/Select'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'
import green from '@material-ui/core/colors/green'
import CsvDropzone from './CsvDropzone'
import CsvParser from '../../../store/transactions/CsvParsers/CsvParser'
// import BmoCsvParser from '../../../store/transactions/CsvParsers/BmoCsvParser'
// import TdCsvParser from '../../../store/transactions/CsvParsers/TdCsvParser'
// import TangerineCsvParser from '../../../store/transactions/CsvParsers/TangerineCsvParser'

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    margin: '20px'
  },
  formField: {
    width: '100%'
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

// const parsers = {
//   RBC: RbcCsvParser,
//   BMO: BmoCsvParser,
//   TD: TdCsvParser,
//   Tangerine: TangerineCsvParser
// }
const DONT_IMPORT = 'Don\'t import'

class CsvImportForm extends React.Component {
  state = {
    isSubmitting: false,
    file: null,
    error: null,
    transactionFields: {
      description: { label: 'Description', mapTo: DONT_IMPORT },
      amount: { label: 'Amount', mapTo: DONT_IMPORT },
      createdAt: { label: 'Date', mapTo: DONT_IMPORT }
    },
    csvHeader: null
  }

  setSubmitting = (value) => {
    this.setState({ isSubmitting: value })
  }

  handleFileUpload = async (acceptedFiles) => {
    if (acceptedFiles[0].type !== 'text/csv') {
      this.setState({
        file: null,
        error: 'The file you uploaded is not a CSV file'
      })
    } else {
      this.setState({ file: acceptedFiles[0] })
      const parser = new CsvParser(acceptedFiles[0])
      this.setState({ csvHeader: await parser.getHeaders() })
    }
  }

  handleChange = ({ target }) => {
    const { transactionFields } = this.state
    if (target.value === DONT_IMPORT) {
      const oldSelection = Object.keys(transactionFields)
        .find(field => transactionFields[field].mapTo === target.name)

      this.setState({
        transactionFields: {
          ...transactionFields,
          [oldSelection]: {
            ...transactionFields[oldSelection],
            mapTo: DONT_IMPORT
          }
        }
      })
    } else {
      this.setState({
        transactionFields: {
          ...transactionFields,
          [target.value]: {
            ...transactionFields[target.value],
            mapTo: target.name
          }
        }
      })
    }
    this.setState({
      csvHeader: {
        ...this.state.csvHeader,
        [target.name]: target.value
      }
    })
  }

  handleSubmit = (event) => {
    console.log(event)
    // const { account, handleParsedData } = this.props
    // new parsers[account.institution]().parse(this.state.file, account)
    //   .then(({ transactions, errors }) => {
    //     this.setSubmitting(false)
    //     handleParsedData(transactions, errors)
    //   })
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
      isSubmitting,
      transactionFields,
      csvHeader
    } = this.state

    return (
      <form onSubmit={this.handleSubmit}>
        <div className={classes.root}>
          {!this.state.csvHeader &&
            <CsvDropzone
              className={classes.dropzone}
              handleFileUpload={this.handleFileUpload}
              account={account}
              file={file}
              error={error}
            />
          }
          {csvHeader &&
            <div>
              <Typography>
                {file.name}
              </Typography>
              <Typography>
                Choose the transaction fields that match the CSV columns
              </Typography>
              <Table className={classes.table}>
                <TableBody>
                  {Object.keys(csvHeader).map(csvField => (
                    <TableRow key={csvField} selected={csvHeader[csvField] !== DONT_IMPORT}>
                      <TableCell align="right">{csvField}</TableCell>
                      <TableCell align="left">
                        <FormControl variant="outlined" className={classes.formField}>
                          <Select
                            value={csvHeader[csvField] || ''}
                            onChange={this.handleChange}
                            inputProps={{ name: `${csvField}`, id: `${csvField}` }}
                          >
                            <MenuItem key={DONT_IMPORT} value={DONT_IMPORT}>
                              <Typography color="textSecondary">{DONT_IMPORT}</Typography>
                            </MenuItem>
                            {Object.keys(transactionFields).map(field => (
                              <MenuItem
                                key={field}
                                value={field}
                                disabled={transactionFields[field].mapTo !== DONT_IMPORT}
                              >
                                {transactionFields[field].label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          }
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
  // handleParsedData: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired
}

export default withStyles(styles)(CsvImportForm)
