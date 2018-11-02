import React from 'react'
import { compose } from 'recompose'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { withFormik } from 'formik'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'
import green from '@material-ui/core/colors/green'
import CsvDropzone from './CsvDropzone'
import CsvImportFields from './CsvImportFields'
import RbcCsvParser from '../../store/transactions/CsvParsers/RbcCsvParser'
import BmoCsvParser from '../../store/transactions/CsvParsers/BmoCsvParser'
import TdCsvParser from '../../store/transactions/CsvParsers/TdCsvParser'
import TangerineCsvParser from '../../store/transactions/CsvParsers/TangerineCsvParser'

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
  wrapper: {
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
    file: null,
    error: null
  }

  handleFileUpload = (acceptedFiles) => {
    this.setState({
      file: acceptedFiles[0],
      error: (acceptedFiles[0].type === 'text/csv' ? null : 'The file you uploaded is not a CSV file')
    })
    this.props.setFieldValue('file', acceptedFiles[0])
  }

  render() {
    const {
      classes,
      handleSubmit,
      values,
      handleChange,
      onCancel,
      institution,
      isSubmitting
    } = this.props

    const {
      file,
      error
    } = this.state

    return (
      <form onSubmit={handleSubmit}>
        <div className={classes.root}>
          <CsvImportFields
            institution={institution}
            values={values}
            handleChange={handleChange}
          />
          <CsvDropzone
            className={classes.dropzone}
            handleFileUpload={this.handleFileUpload}
            institution={institution}
            file={file}
            error={error}
          />
        </div>
        <Divider />
        <div className={classes.formActions}>
          <div className={classes.wrapper}>
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
  handleSubmit: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  institution: PropTypes.string.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
}

export default compose(
  withStyles(styles),
  withFormik({
    mapPropsToValues: ({ institution }) => ({
      institution,
      account: '',
      type: '',
      ticker: '',
      shares: '',
      bookValue: '',
      createdAt: new Date(),
      file: null
    }),
    handleSubmit: (values, { props, setSubmitting }) => {
      setSubmitting(true)
      new parsers[values.institution]().parse(values.file, values)
        .then(({ transactions, errors }) => {
          setSubmitting(false)
          props.handleParsedData(transactions, errors)
        })
    }
  })
)(CsvImportForm)
