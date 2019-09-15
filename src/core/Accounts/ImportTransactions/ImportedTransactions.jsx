/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import Popover from '@material-ui/core/Popover'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import green from '@material-ui/core/colors/green'
import red from '@material-ui/core/colors/red'
import pluralize from 'pluralize'
import { Column } from 'react-virtualized'
import ResultsToolbar from './ResultsToolbar'
import TransactionsTable from '../Transactions/TransactionsTable'

const useStyles = makeStyles((theme) => ({
  tableWrapper: {
    height: 'calc(100vh - 350px)',
    marginBottom: 100
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '10px'
  },
  iconCheck: {
    color: green[500],
    marginRight: '8px',
    'vertical-align': 'text-bottom',
    fontSize: 18
  },
  iconError: {
    color: red[800],
    marginRight: '8px',
    verticalAlign: 'text-bottom',
    fontSize: 18
  },
  popover: {
    padding: theme.spacing(2)
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
  iconErrorInPopup: {
    color: red[800],
    marginRight: '8px',
    verticalAlign: 'text-bottom',
    fontSize: 18
  },
  clickable: {
    cursor: 'pointer'
  },
  dontImportCell: {
    color: theme.palette.action.disabled
  }
}))

const DONT_IMPORT = 'Don\'t import'

const ImportedTransactions = ({
  account,
  parser,
  onSave,
  handlePrevStep
}) => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)
  const [popupRowData, setPopupRowData] = useState(null)

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  const handleOpenPopup = (event, rowData) => {
    setAnchorEl(event.currentTarget)
    setPopupRowData(rowData)
  }

  const handleClosePopup = () => {
    setAnchorEl(null)
    setPopupRowData(null)
  }

  const filterByErrors = (transaction) => (
    Object.keys(transaction).includes('errors') && transaction.errors.length > 0
  )

  const toolbarProps = () => {
    const transactionsWithErrors = parser.transactions.filter(filterByErrors)
    let subTitle = 'No errors'

    if (transactionsWithErrors.length > 0) {
      subTitle = (
        <div>
          {pluralize('transaction', transactionsWithErrors.length, true)} have errors and will not be imported
          <br />
          Click on the <ErrorIcon className={classes.iconError} />
          icon next to each transaction to see more details
        </div>
      )
    }

    return {
      title: 'Check the imported amounts and dates before saving',
      subTitle,
      onSave,
      handlePrevStep
    }
  }

  const errorCellRenderer = (data) => {
    if (data.cellData.length === 0) {
      return <CheckCircleIcon className={classes.iconCheck} />
    }
    return (
      <ErrorIcon
        aria-owns={id}
        aria-haspopup="true"
        data-testid="errorIconButton"
        onClick={(event) => handleOpenPopup(event, data.rowData)}
        className={[classes.iconError, classes.clickable].join(' ')}
      />
    )
  }

  return (
    <div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopup}
        classes={{ paper: classes.popover }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        {popupRowData && (
          <Grid container>
            <Grid item xs={12} className={classes.popoverHeader}>
              <Typography variant="h6">
                A problem was found with the transaction on line {popupRowData.line}
                <Typography variant="caption" paragraph>
                  <ErrorIcon className={classes.iconErrorInPopup} />
                  {popupRowData.errors.join(', ')}
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
        )}
      </Popover>
      <TransactionsTable
        className={classes.tableWrapper}
        account={account}
        transactions={parser.transactions}
        hideChekboxes
        Toolbar={ResultsToolbar}
        toolbarProps={toolbarProps()}
      >
        <Column
          width={20}
          disableSort={true}
          dataKey="errors"
          cellRenderer={errorCellRenderer}
        />
        <Column
          width={40}
          disableSort={true}
          dataKey="line"
        />
      </TransactionsTable>
    </div>
  )
}

ImportedTransactions.propTypes = {
  account: PropTypes.object.isRequired,
  parser: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  handlePrevStep: PropTypes.func.isRequired
}

export default ImportedTransactions
