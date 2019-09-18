import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import ErrorIcon from '@material-ui/icons/Error'

const useStyles = makeStyles((theme) => ({
  iconError: {
    color: theme.palette.danger.icon,
    marginRight: '8px',
    verticalAlign: 'text-bottom',
    fontSize: 22
  },
  popoverHeader: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  closeButton: {
    height: 50
  },
  dontImportCell: {
    color: theme.palette.action.disabled
  }
}))

const DONT_IMPORT = 'Don\'t import'

const ErrorPopupContent = ({
  parser,
  popupRowData,
  handleClosePopup

}) => {
  const classes = useStyles()
  return (
    <Grid container>
      <Grid item xs={12} className={classes.popoverHeader}>
        <Typography variant="h6">
          <ErrorIcon className={classes.iconError} />
          Line {popupRowData.line} has an error
          <Typography variant="caption" paragraph>
            {popupRowData.errors.join(', ')}
            <br />
            The CSV data is shown bellow
          </Typography>
        </Typography>
        <IconButton
          aria-label="Close"
          className={classes.closeButton}
          onClick={handleClosePopup}
          data-testid="closeIconButton"
        >
          <CloseIcon />
        </IconButton>
      </Grid>
      <Grid item xs={12}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Line #</TableCell>
              {parser.csvHeader.map((column, index) => {
                if (column.transactionField === DONT_IMPORT) {
                  return (
                    <TableCell key={`header-${index + popupRowData.line}`} className={classes.dontImportCell}>
                      Don&apos;t Import
                    </TableCell>
                  )
                }
                return (
                  <TableCell key={column.transactionField}>
                    {parser.transactionFields[column.transactionField].label}
                  </TableCell>
                )
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{popupRowData.line}</TableCell>
              {parser.csvHeader.map((column, index) => {
                return (
                  <TableCell
                    key={`cell-${index + popupRowData.line}`}
                    className={column.transactionField === DONT_IMPORT ? classes.dontImportCell : null}
                  >
                    {parser.csvData[popupRowData.line - 1][index]}
                  </TableCell>
                )
              })}
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  )
}

ErrorPopupContent.propTypes = {
  parser: PropTypes.object.isRequired,
  popupRowData: PropTypes.object.isRequired,
  handleClosePopup: PropTypes.func.isRequired
}
export default ErrorPopupContent
