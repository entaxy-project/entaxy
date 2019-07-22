/* eslint-disable no-console */
/* eslint-disable react/no-array-index-key */
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
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
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
    tableHeader: {
      height: 20,
      background: theme.palette.grey[500]
    },
    tableCell: {
      width: 150,
      color: 'white'
    },
    sample: {
      color: theme.palette.grey[500],
      fontSize: 11,
      width: 150,
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    },
    elipsys: {
      textOverflow: 'ellipsis'
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
      margin: theme.spacing(1),
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

export class CsvImportFormComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isSubmitting: false,
      file: null,
      error: null,
      csvHeader: null,
      dateFormat: null
    }
    this.parser = new CsvParser(this.props.budgetRules)
  }

  handleFileUpload = async (acceptedFiles) => {
    if (acceptedFiles[0].type !== 'text/csv') {
      this.setState({
        file: null,
        error: 'The file you uploaded is not a CSV file'
      })
    } else {
      await this.parser.parse(acceptedFiles[0])
      this.setState({
        file: acceptedFiles[0],
        error: null,
        csvHeader: this.parser.csvHeader,
        dateFormat: this.parser.dateFormat
      })
    }
  }

  handleChange = ({ target }) => {
    this.parser.mapColumnToTransactionField({
      columnIndex: parseInt(target.name, 10),
      transactionField: target.value
    })
    this.setState({ csvHeader: this.parser.csvHeader })
  }

  handleChangeDateFormat = ({ target }) => {
    this.parser.dateFormat = target.value
    this.setState({ dateFormat: this.parser.dateFormat })
  }

  handleChangeNoHeaderRow = ({ target }) => {
    this.parser.noHeaderRow = target.checked
    this.setState({ noHeaderRow: this.parser.noHeaderRow })
  }

  handleSubmit = (event) => {
    this.setState({ isSubmitting: true })
    const { handleParsedData } = this.props
    const { transactions, errors } = this.parser.mapToTransactions()
    handleParsedData(transactions, errors)
    this.setState({ isSubmitting: false })
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
      csvHeader,
      dateFormat
    } = this.state

    return (
      <form onSubmit={this.handleSubmit}>
        <div className={classes.root}>
          {(!file || error) && (
            <CsvDropzone
              className={classes.dropzone}
              handleFileUpload={this.handleFileUpload}
              account={account}
              file={file}
              error={error}
            />
          )}
          {file && !error && (
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
                  <TableRow className={classes.tableHeader}>
                    <TableCell className={classes.tableCell} align="right">CSV column</TableCell>
                    <TableCell className={classes.tableCell}>Transaction field</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {csvHeader.map(({ label, transactionField, sample }, index) => (
                    <TableRow key={`${index}-${label}`} selected={transactionField !== DONT_IMPORT}>
                      <TableCell align="right">
                        {label}
                        <div className={classes.sample}>
                          <div className={classes.elipsys}>{sample}</div>
                        </div>
                      </TableCell>
                      <TableCell align="left">
                        <FormControl className={classes.formField}>
                          <Select
                            value={transactionField}
                            onChange={this.handleChange}
                            inputProps={{ name: `${index}` }}
                          >
                            <MenuItem key={DONT_IMPORT} value={DONT_IMPORT}>
                              <Typography color="textSecondary">{DONT_IMPORT}</Typography>
                            </MenuItem>
                            {Object.keys(this.parser.transactionFields).map(field => (
                              <MenuItem
                                key={field}
                                value={field}
                                disabled={this.parser.isFieldSelected(field)}
                              >
                                {this.parser.transactionFields[field].label}
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
                <FormControlLabel
                  className={classes.formField}
                  control={(
                    <Checkbox
                      checked={this.state.noHeaderRow}
                      onChange={this.handleChangeNoHeaderRow}
                      value="noHeaderRow"
                    />
                  )}
                  label="No header row"
                />
                <FormControl className={classes.formField}>
                  <InputLabel htmlFor="dateFormat">Date format</InputLabel>
                  <Select
                    value={dateFormat}
                    onChange={this.handleChangeDateFormat}
                    inputProps={{ name: 'dateFormat' }}
                  >
                    {this.parser.dateFormats.map(format => (
                      <MenuItem key={format} value={format}>{format}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </div>
          )}
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

CsvImportFormComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  handleParsedData: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  account: PropTypes.object.isRequired,
  budgetRules: PropTypes.object.isRequired
}

export default withStyles(styles)(CsvImportFormComponent)
