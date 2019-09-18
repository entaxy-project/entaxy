import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import WarningIcon from '@material-ui/icons/Warning'
import TransactionsTable from '../Transactions/TransactionsTable'
import TableToolbar from '../../../common/TableToolbar'

const useStyles = makeStyles((theme) => ({
  tableWrapper: {
    marginBottom: 70
  },
  iconWarning: {
    color: theme.palette.warning.icon,
    marginRight: '8px',
    verticalAlign: 'text-bottom',
    fontSize: 22
  },
  popoverHeader: {
    paddingRight: theme.spacing(2),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 800
  },
  closeButton: {
    height: 50,
    position: 'absolute',
    top: -10,
    right: 0
  },
  dontImportCell: {
    color: theme.palette.action.disabled
  }
}))

const DuplicatePopupContent = ({
  account,
  popupRowData,
  handleClosePopup

}) => {
  const classes = useStyles()
  return (
    <TransactionsTable
      className={classes.tableWrapper}
      account={account}
      transactions={[popupRowData.duplicate]}
      Toolbar={() => (
        <TableToolbar
          title={(
            <>
              <WarningIcon className={classes.iconWarning} />
              Line {popupRowData.line} is a duplicate
            </>
          )}
          subTitle={(
            <div className={classes.popoverHeader}>
              <Typography variant="caption" paragraph>
                The existing transaction is shown bellow
              </Typography>
              <IconButton
                aria-label="Close"
                className={classes.closeButton}
                onClick={handleClosePopup}
                data-testid="closeIconButton"
              >
                <CloseIcon />
              </IconButton>
            </div>
          )}
          selectedItems={[]}
        />
      )}
      toolbarProps={{}}
      hideChekboxes
    />
  )
}

DuplicatePopupContent.propTypes = {
  account: PropTypes.object.isRequired,
  popupRowData: PropTypes.object.isRequired,
  handleClosePopup: PropTypes.func.isRequired
}
export default DuplicatePopupContent
