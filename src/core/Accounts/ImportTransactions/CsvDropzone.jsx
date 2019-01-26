import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Dropzone from 'react-dropzone'
import Icon from '@mdi/react'
import { mdiFileUploadOutline } from '@mdi/js'

const styles = theme => ({
  root: {
    border: '3px dashed rgb(200, 200, 200)',
    borderRadius: '5px',
    padding: '50px',
    cursor: 'pointer',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'flex-direction': 'row'
  },
  menuIcon: {
    marginRight: '5px',
    'vertical-align': 'bottom',
    fill: theme.palette.text.secondary
  }
})

const CsvDropzone = ({
  classes,
  handleFileUpload,
  file,
  error
}) => (
  <Dropzone multiple={false} className={classes.root} onDrop={handleFileUpload}>
    <div>
      {file &&
        <Typography variant="subtitle2" align="center">
          <Icon
            path={mdiFileUploadOutline}
            size={1}
            className={classes.menuIcon}
            color="textSecondary"
          />
          {file.name}
        </Typography>
      }
      {error &&
        <Typography variant="subtitle2" align="center" color="error">{error}</Typography>
      }
      {!file &&
        <div>
          <Typography variant="h4" align="center" color="textSecondary">
            Drag a CSV file here
          </Typography>
          <Typography variant="subtitle2" align="center" color="textSecondary">
            or click to select a file to upload.
          </Typography>
        </div>
      }
    </div>
  </Dropzone>
)

CsvDropzone.propTypes = {
  classes: PropTypes.object.isRequired,
  handleFileUpload: PropTypes.func.isRequired,
  error: PropTypes.string,
  file: PropTypes.object
}

CsvDropzone.defaultProps = {
  error: null,
  file: null
}

export default withStyles(styles)(CsvDropzone)
