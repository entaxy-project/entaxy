/* eslint-disable no-console */
import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Typography from '@material-ui/core/Typography'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'
import green from '@material-ui/core/colors/green'
import Icon from '@mdi/react'
import { mdiFileDelimited } from '@mdi/js'
import CsvDropzone from './CsvDropzone'
import CsvParser from '../../../store/transactions/CsvParsers/CsvParser'

const styles = (theme) => {
  console.log('theme', theme)

  return ({
    root: {
      display: 'flex',
      justifyContent: 'center',
      margin: '20px'
    },
    fileDetails: {
      display: 'flex',
      padding: 5,
      background: theme.palette.secondary.light,
      color: theme.palette.primary.contrastText,
      borderRadius: 4,
      marginBottom: 10
    },
    csvFileIcon: {
      marginRight: 5,
      verticalAlign: 'text-bottom',
      fill: '#fff'
    },
    formField: {
      width: '100%'
    },
    table: {
      marginBottom: 20
    },
    formOptions: {
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      marginTop: 10,
      padding: 10,
      border: 'solid #999 2px'
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
}

const DONT_IMPORT = 'Don\'t import'
const parser = new CsvParser()

class CsvImportForm extends React.Component {
  state = {
    isSubmitting: false,
    file: null,
    error: null,
    transactionFields: {
      description: { label: 'Description', column: { name: DONT_IMPORT, index: null } },
      amount: { label: 'Amount', column: { name: DONT_IMPORT, index: null } },
      createdAt: { label: 'Date', column: { name: DONT_IMPORT, index: null } }
    },
    csvHeader: null,
    dateFormat: null
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
      const csvHeader = await parser.getHeaders(acceptedFiles[0])
      const transactionFields = {}
      Object.keys(csvHeader).forEach((column, index) => {
        if (csvHeader[column] !== DONT_IMPORT) {
          transactionFields[csvHeader[column]] = {
            ...this.state.transactionFields[csvHeader[column]],
            column: { name: column, index }
          }
        }
      })
      this.setState({
        file: acceptedFiles[0],
        csvHeader,
        transactionFields,
        dateFormat: parser.dateFormat
      })
    }
  }

  handleChange = ({ target }) => {
    const { transactionFields, csvHeader } = this.state
    if (target.value === DONT_IMPORT) {
      const oldSelection = Object.keys(transactionFields)
        .find(field => transactionFields[field].column.name === target.name)
      this.setState({
        transactionFields: {
          ...transactionFields,
          [oldSelection]: {
            ...transactionFields[oldSelection],
            column: { name: DONT_IMPORT, index: null }
          }
        }
      })
    } else {
      this.setState({
        transactionFields: {
          ...transactionFields,
          [target.value]: {
            ...transactionFields[target.value],
            column: {
              name: target.name,
              index: Object.keys(csvHeader).indexOf(target.name)
            }
          }
        }
      })
    }
    this.setState({
      csvHeader: {
        ...csvHeader,
        [target.name]: target.value
      }
    })
  }

  handleSubmit = (event) => {
    // const { handleParsedData } = this.props
    const res = parser.mapToTransactions({
      transactionFieldsMap: this.state.transactionFields
    })
    console.log('res', res)
    // .then(({ transactions, errors }) => {
    //   this.setSubmitting(false)
    //   handleParsedData(transactions, errors)
    // })
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
      csvHeader,
      dateFormat
    } = this.state
    console.log('csvHeader', csvHeader)
    console.log('transactionFields', transactionFields)
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
              <Typography variant="subtitle2" className={classes.fileDetails}>
                <Icon path={mdiFileDelimited} size={0.7} className={classes.csvFileIcon} />
                {file.name}
              </Typography>
              <Typography variant="caption">
                Choose the transaction field that matches each CSV columns
              </Typography>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell align="right">CSV column</TableCell>
                    <TableCell>Transaction field</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(csvHeader).map(csvField => (
                    <TableRow key={csvField} selected={csvHeader[csvField] !== DONT_IMPORT}>
                      <TableCell align="right">{csvField}</TableCell>
                      <TableCell align="left">
                        <FormControl className={classes.formField}>
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
                                disabled={transactionFields[field].column.index !== null}
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
              <Typography variant="subtitle2">Import options</Typography>
              <Paper elevation={0} className={classes.formOptions}>
                <FormControl className={classes.formField}>
                  <InputLabel htmlFor="dateFormat">Date format</InputLabel>
                  <Select
                    value={dateFormat}
                    onChange={this.handleChange}
                    inputProps={{ name: `${dateFormat}`, id: `${dateFormat}` }}
                  >
                    {parser.dateFormats.map(format => (
                      <MenuItem key={format} value={format}>{format}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
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
