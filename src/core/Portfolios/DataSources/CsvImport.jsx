/* eslint no-console: 0 */
import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Dropzone from 'react-dropzone'
import Papa from 'papaparse'

const styles = () => ({
  root: {
    flexGrow: 1,
    float: 'right',
    width: '200px',
    border: '2px dashed rgb(112, 112, 112)',
    borderRadius: '5px',
    padding: '10px',
    cursor: 'pointer'
  }
})

class CsvImport extends React.Component {
  onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      Papa.parse(file, {
        complete: (results) => {
          console.log('Finished:', results.data)
        }
      })
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Dropzone className={classes.root} onDrop={this.onDrop}>
        <Typography variant="caption" align="center">
          Try dropping some files here, or click to select files to upload.
        </Typography>
      </Dropzone>
    )
  }
}

CsvImport.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(CsvImport)
