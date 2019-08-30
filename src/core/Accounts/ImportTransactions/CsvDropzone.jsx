import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Dropzone from 'react-dropzone'
import Icon from '@mdi/react'
import CircularProgress from '@material-ui/core/CircularProgress'
import { mdiFileUploadOutline } from '@mdi/js'

const useStyles = makeStyles((theme) => ({
  root: {
    border: '3px dashed rgb(200, 200, 200)',
    borderRadius: '5px',
    padding: '50px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    margin: theme.spacing(2),
    marginTop: theme.spacing(4)
  },
  menuIcon: {
    marginRight: '5px',
    'vertical-align': 'bottom',
    fill: theme.palette.text.secondary
  },
  circularProgress: {
    marginRight: theme.spacing(2)
  }
}))

const CsvDropzone = ({
  parser,
  handleNextStep
}) => {
  const classes = useStyles()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)


  const handleFileUpload = async (acceptedFiles) => {
    if (acceptedFiles[0].type !== 'text/csv') {
      setError({
        filename: acceptedFiles[0].name,
        message: 'The file you uploaded is not a CSV file'
      })
    } else {
      setError(null)
      setIsLoading(true)
      await parser.parse(acceptedFiles[0])
      handleNextStep()
    }
  }

  return (
    <Dropzone multiple={false} onDrop={handleFileUpload}>
      {({ getRootProps, getInputProps }) => (
        <div className={classes.root} {...getRootProps()}>
          <input data-testid="dopzone-input" {...getInputProps()} />
          {!parser.file && !isLoading && (
            <>
              <Typography variant="h4" align="center" color="textSecondary">
                Drag a CSV file here
              </Typography>
              <Typography variant="subtitle2" align="center" color="textSecondary">
                or click to select a file to upload.
              </Typography>
            </>
          )}
          {isLoading && (
            <Typography variant="h4" align="center" color="textSecondary">
              <CircularProgress color="secondary" disableShrink size={30} className={classes.circularProgress} />
              Reading file ...
            </Typography>
          )}
          {error && (
            <>
              <Typography variant="subtitle2" align="center" color="textSecondary">
                <Icon
                  path={mdiFileUploadOutline}
                  size={1}
                  className={classes.menuIcon}
                  color="textSecondary"
                />
                {error.filename}
              </Typography>
              <Typography variant="subtitle2" align="center" color="error">{error.message}</Typography>
            </>
          )}
        </div>
      )}
    </Dropzone>
  )
}

CsvDropzone.propTypes = {
  parser: PropTypes.object.isRequired,
  handleNextStep: PropTypes.func.isRequired
}

export default CsvDropzone
