import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardHeader from '@material-ui/core/CardHeader'
import GetAppIcon from '@material-ui/icons/GetApp'
import PublishIcon from '@material-ui/icons/Publish'
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
import RootRef from '@material-ui/core/RootRef'
import { useDropzone } from 'react-dropzone'
import { showSnackbar } from '../../store/user/actions'
import { resetState } from '../../store'
import confirm from '../../util/confirm'

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(2)
  },
  formHeader: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  closeButton: {
    marginTop: -10
  },
  downloadLink: {
    textDecoration: 'none'
  },
  buttonIcon: {
    marginRight: theme.spacing(1)
  }
}))

const ImportExport = ({ history }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const data = useSelector((state) => {
    const { user, ...rest } = state
    return `text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(rest))}`
  })

  const onDrop = useCallback((acceptedFiles) => {
    const reader = new FileReader()
    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
    reader.onload = () => {
      const newState = JSON.parse(reader.result)
      confirm('Replace all your data? This cannot be undone.', 'Are you sure?').then(async () => {
        dispatch(resetState(newState))
        dispatch(showSnackbar({ text: 'Your data has been replaced', status: 'success' }))
        history.push('/dashboard')
      })
    }
    reader.readAsText(acceptedFiles[0])
  }, [dispatch, history])

  const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false, accept: '.json' })
  const { ref, ...rootProps } = getRootProps()

  return (
    <>
      <Card className={classes.root}>
        <CardHeader
          title="Export all your data"
          subheader="You can dowload a backup of your data in JSON format. You can use this to restore your data later"
        />
        <CardActions>
          <Button>
            <GetAppIcon className={classes.buttonIcon} />
            <Link
              href={`data:'${data}`}
              download="entaxy.json"
              underline="none"
            >
              Download
            </Link>
          </Button>
        </CardActions>
      </Card>
      <Card className={classes.root}>
        <CardHeader
          title="Import new data"
          subheader="Upload a JSON file you previously downloaded, replacing any existing data."
        />
        <CardActions>
          <RootRef rootRef={ref}>
            <Button {...rootProps}>
              <input {...getInputProps()} />
              <PublishIcon className={classes.buttonIcon} />
              Upload
            </Button>
          </RootRef>
        </CardActions>
      </Card>
    </>
  )
}

ImportExport.propTypes = {
  history: PropTypes.object.isRequired
}

export default ImportExport
