/* eslint no-console: 0 */
/* eslint-disable no-unused-vars */
import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Dropzone from 'react-dropzone'
import { importTransactionsFromFiles } from '../../../store/transactions/actions'

const styles = () => ({
  root: {
    flexGrow: 1,
    float: 'right',
    width: '200px',
    border: '3px dashed rgb(200, 200, 200)',
    borderRadius: '5px',
    padding: '10px',
    margin: '20px',
    cursor: 'pointer'
  }
})


const mapDispatchToProps = (dispatch, props) => {
  return {
    handleUpload: (acceptedFiles) => {
      console.log(props.institution)
      dispatch(importTransactionsFromFiles(acceptedFiles[0], props.institution))
    }
  }
}

const CsvImport = ({ classes, institution, handleUpload }) => (
  <Dropzone multiple={false} className={classes.root} onDrop={handleUpload}>
    <Typography variant="caption" align="center">
      Try dropping some files here, or click to select files to upload.
    </Typography>
  </Dropzone>
)

CsvImport.propTypes = {
  classes: PropTypes.object.isRequired,
  institution: PropTypes.string.isRequired,
  handleUpload: PropTypes.func.isRequired
}

export default compose(
  connect(null, mapDispatchToProps),
  withStyles(styles)
)(CsvImport)
