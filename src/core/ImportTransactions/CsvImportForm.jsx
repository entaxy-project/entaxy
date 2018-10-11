/* eslint no-console: 0 */
import React from 'react'
import { compose } from 'recompose'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withFormik } from 'formik'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import CsvDropzone from './CsvDropzone'
import CsvImportFields from './CsvImportFields'
import { addTransactions } from '../../store/transactions/actions'
import RbcCsvParser from '../../store/transactions/CsvParsers/RbcCsvParser'
import BmoCsvParser from '../../store/transactions/CsvParsers/BmoCsvParser'
import TdCsvParser from '../../store/transactions/CsvParsers/TdCsvParser'
import TangerineCsvParser from '../../store/transactions/CsvParsers/TangerineCsvParser'


const styles = () => ({
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
  }
})

const parsers = {
  RBC: RbcCsvParser,
  BMO: BmoCsvParser,
  TD: TdCsvParser,
  Tangerine: TangerineCsvParser
}

const mapDispatchToProps = (dispatch) => {
  return {
    saveTransactions: (transactions) => {
      return dispatch(addTransactions(transactions))
    }
  }
}

class CsvImportForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null,
      error: null
    }
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
      institution
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
          <Button type="submit" color="secondary" disabled={!file || error}>Import</Button>
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
  setFieldValue: PropTypes.func.isRequired
}

export default compose(
  connect(null, mapDispatchToProps),
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
      console.log('handleSubmit', props)
      setSubmitting(true)
      const parser = new parsers[values.institution](values.file, values)
      return parser.parse()
        .then((transactions) => {
          console.log(transactions)
          return props.saveTransactions(transactions)
        }).then(() => {
          console.log('done')
          setSubmitting(false)
          props.onCancel()
        })
    }
  })
)(CsvImportForm)
