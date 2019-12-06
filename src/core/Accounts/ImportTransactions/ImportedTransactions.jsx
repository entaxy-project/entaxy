/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import WarningIcon from '@material-ui/icons/Warning'
import ErrorIcon from '@material-ui/icons/Error'
import Popover from '@material-ui/core/Popover'
import pluralize from 'pluralize'
import { Column } from 'react-virtualized'
import ResultsToolbar from './ResultsToolbar'
import ErrorPopupContent from './ErrorPopupContent'
import TransactionsTable from '../Transactions/TransactionsTable'
import { filterByErrors, filterByDuplicates } from '../../../store/transactions/actions'

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
    color: theme.palette.success.icon,
    marginRight: '8px',
    'vertical-align': 'text-bottom',
    fontSize: 18
  },
  iconError: {
    color: theme.palette.danger.icon,
    marginRight: '8px',
    verticalAlign: 'text-bottom',
    fontSize: 18
  },
  iconWarning: {
    color: theme.palette.warning.icon,
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
  smallIcon: {
    fontSize: 14
  },
  clickable: {
    cursor: 'pointer'
  },
  dontImportCell: {
    color: theme.palette.action.disabled
  }
}))

const ImportedTransactions = ({
  account,
  parser,
  handlePrevStep,
  handleNextStep,
  handleGenerateTransactions,
  isGeneratingTransactions
}) => {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)
  const [popupRowData, setPopupRowData] = useState(null)
  const [invertAmount, setInvertAmount] = useState(parser.invertAmount)

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

  const handleChangeInvertAmount = (event) => {
    // eslint-disable-next-line no-param-reassign
    parser.invertAmount = event.target.checked
    setInvertAmount(parser.invertAmount)
    handleGenerateTransactions(event, { moveToNextStep: false })
  }

  const toolbarProps = () => {
    const transactionsWithErrors = parser.transactions.filter(filterByErrors)
    const transactionsWithDuplicates = parser.transactions.filter(filterByDuplicates)
    const importCount = parser.transactions.length - transactionsWithErrors.length - transactionsWithDuplicates.length

    const errorText = transactionsWithErrors.length > 0 ? (
      <>
        Found <ErrorIcon className={classes.iconError} />
        {pluralize('error', transactionsWithErrors.length, true)}
        <br />
      </>
    ) : null
    const duplicateText = transactionsWithDuplicates.length > 0 ? (
      <>
        Found <WarningIcon className={classes.iconWarning} />
        {pluralize('duplicate transaction', transactionsWithDuplicates.length, true)}
        <br />
      </>
    ) : null

    const subTitle = errorText || duplicateText ? (
      <>
        {errorText}
        {duplicateText}
        {
          importCount === 0
            ? <strong>No transactions</strong>
            : (
              <>
                Only&nbsp;
                <strong>
                  {importCount}/{parser.transactions.length}&nbsp;
                  {pluralize('transaction', importCount, false)}
                </strong>
              </>
            )
        }
        &nbsp;will be imported
      </>
    ) : 'No errors'

    return {
      subTitle,
      handleNextStep,
      handlePrevStep,
      invertAmount,
      handleChangeInvertAmount,
      isGeneratingTransactions
    }
  }

  const errorCellRenderer = (data) => {
    if (data.cellData.length === 0) {
      if (data.rowData.duplicate !== undefined) {
        return (
          <WarningIcon
            aria-owns={id}
            aria-haspopup="true"
            data-testid="warningIconButton"
            className={classes.iconWarning}
          />
        )
      }
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
        {popupRowData && popupRowData.errors.length > 0 && (
          <ErrorPopupContent
            parser={parser}
            popupRowData={popupRowData}
            handleClosePopup={handleClosePopup}
          />
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
  handlePrevStep: PropTypes.func.isRequired,
  handleNextStep: PropTypes.func.isRequired,
  handleGenerateTransactions: PropTypes.func.isRequired,
  isGeneratingTransactions: PropTypes.bool.isRequired
}

export default ImportedTransactions
