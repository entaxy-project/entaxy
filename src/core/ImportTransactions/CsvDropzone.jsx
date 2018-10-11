/* eslint no-console: 0 */
/* eslint-disable no-unused-vars */
import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Dropzone from 'react-dropzone'
import Icon from '@mdi/react'
import { mdiFileUploadOutline } from '@mdi/js'

const styles = theme => ({
  root: {
    border: '3px dashed rgb(200, 200, 200)',
    borderRadius: '5px',
    padding: '10px',
    margin: '20px',
    cursor: 'pointer'
  },
  menuIcon: {
    marginRight: theme.spacing.unit
  },
  dropzone: {
    border: '3px dashed rgb(200, 200, 200)',
    borderRadius: '5px',
    padding: '10px',
    margin: '20px',
    cursor: 'pointer'
  }
})


const CsvDropzone = ({
  classes,
  institution,
  handleFileUpload,
  file,
  error
}) => (
  <Dropzone multiple={false} className={classes.dropzone} onDrop={handleFileUpload}>
    {file &&
      <Typography variant="subtitle2" align="center">
        {file.name}
      </Typography>
    }
    {error &&
      <Typography variant="subtitle2" align="center" color="error">{error}</Typography>
    }
    <Typography variant="caption" align="center">
      <Icon
        path={mdiFileUploadOutline}
        size={1}
        className={classes.menuIcon}
      />
      Drop a CSV file here, or click to select a file to upload.
    </Typography>
  </Dropzone>
)

CsvDropzone.propTypes = {
  classes: PropTypes.object.isRequired,
  institution: PropTypes.string.isRequired,
  handleFileUpload: PropTypes.func.isRequired,
  error: PropTypes.string,
  file: PropTypes.object
}

CsvDropzone.defaultProps = {
  error: null,
  file: null
}
export default compose(withStyles(styles))(CsvDropzone)
