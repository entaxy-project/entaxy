import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import IconButton from '@material-ui/core/IconButton'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import Paper from '@material-ui/core/Paper'
import Fade from '@material-ui/core/Fade'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Icon from '@mdi/react'
import Divider from '@material-ui/core/Divider'
import { mdiFileUploadOutline, mdiUploadNetwork } from '@mdi/js'
import Header from '../../common/Header'
import CsvImportForm from './CsvImportForm'
import RbcLogo from './logos/RBC.png'
import BmoLogo from './logos/BMO.png'
import TdLogo from './logos/TD.png'
import TangerineLogo from './logos/Tangerine.png'
import QuestradeLogo from './logos/Questrade.png'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    margin: '10px 5px',
    padding: '20px'
  },
  title: {
    padding: '20px'
  },
  cards: {
    display: 'flex',
    'flex-direction': 'row',
    'flex-wrap': 'wrap',
    'justify-content': 'center'
  },
  card: {
    margin: '10px'
  },
  cardHeader: {
    'padding-left': '60px',
    'margin-left': '10px',
    'background-size': '50px',
    'background-position': 'left',
    'background-repeat': 'no-repeat'
  },
  RBC: {
    'background-image': `url(${RbcLogo})`
  },
  BMO: {
    'background-image': `url(${BmoLogo})`
  },
  TD: {
    'background-image': `url(${TdLogo})`
  },
  Tangerine: {
    'background-image': `url(${TangerineLogo})`
  },
  Questrade: {
    'background-image': `url(${QuestradeLogo})`
  },
  menuIcon: {
    marginRight: theme.spacing.unit
  },
  importArea: {
    margin: '10px',
    padding: '10px'
  },
  importAreaHeader: {
    padding: '10px',
    display: 'flex',
    'flex-direction': 'row',
    'justify-content': 'space-between'
  },
  selectedInstitution: {
    padding: '5px 0 5px 30px',
    'margin-left': '10px',
    'background-size': '25px',
    'background-position': 'left',
    'background-repeat': 'no-repeat'

  }
})

const institutions = {
  RBC: {
    importTypes: ['CSV'],
    description: 'Royal Bank'
  },
  BMO: {
    importTypes: ['CSV'],
    description: 'Bank of Montreal'
  },
  TD: {
    importTypes: ['CSV'],
    description: 'TD Canada Trust'
  },
  Tangerine: {
    importTypes: ['CSV'],
    description: 'Personal Banking'
  },
  Questrade: {
    importTypes: ['CSV', 'API'],
    description: 'Keep More of Your Money'
  }
}

export class ImportTransactionsComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null,
      openPopup: false,
      selectedInstitution: 'TD',
      selectedImportType: 'CSV'
    }
  }

  showPopup = institution => (event) => {
    const { currentTarget } = event
    this.setState({
      anchorEl: currentTarget,
      openPopup: true,
      selectedInstitution: institution,
      selectedImportType: null
    })
  }

  closePopup = () => {
    this.setState({
      openPopup: false
    })
  }

  handlePopupSelection = (selectedImportType) => {
    this.setState({ selectedImportType })
  }

  resetSelection = () => {
    this.setState({
      selectedInstitution: null,
      selectedImportType: null
    })
  }

  render() {
    const { classes } = this.props
    const {
      anchorEl,
      openPopup,
      selectedInstitution,
      selectedImportType
    } = this.state

    return (
      <div>
        <Popper open={openPopup} anchorEl={anchorEl} placement="bottom-start" transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper>
                <MenuList role="menu">
                  {_.map(institutions[selectedInstitution].importTypes, importType => (
                    <MenuItem key={importType} onClick={() => this.handlePopupSelection(importType)}>
                      <Icon
                        path={(importType === 'CSV' ? mdiFileUploadOutline : mdiUploadNetwork)}
                        size={1}
                        className={classes.menuIcon}
                      />
                      {selectedInstitution} - {importType}
                    </MenuItem>
                  ))}
                </MenuList>

              </Paper>
            </Fade>
          )}
        </Popper>
        <ClickAwayListener onClickAway={this.closePopup}>
          <div>
            <Header />
            <Typography variant="h5" align="center" className={classes.title}>
              Import transactions
            </Typography>
            {(!selectedInstitution || !selectedImportType) &&
              <div>
                <Typography variant="body1" align="center">
                  Select an institution
                </Typography>
                <div className={classes.cards}>
                  {_.map(institutions, (details, institution) => (
                    <div key={institution}>
                      <Card className={classes.card}>
                        <CardHeader
                          className={`${classes.cardHeader} ${classes[institution]}`}
                          title={institution}
                          subheader={details.description}
                          action={
                            <IconButton onClick={this.showPopup(institution)}>
                              <MoreVertIcon />
                            </IconButton>
                          }
                        />
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            }
            {selectedInstitution && selectedImportType &&
              <Paper className={classes.importArea}>
                <div className={classes.importAreaHeader}>
                  <Typography variant="body1" align="center">
                    Import {selectedImportType} from {selectedInstitution}
                  </Typography>
                  <Typography
                    variant="body1"
                    align="center"
                    className={`${classes.selectedInstitution} ${classes[selectedInstitution]}`}
                  >
                    {selectedInstitution}
                  </Typography>
                </div>
                <Divider />
                {selectedImportType === 'CSV' &&
                  <CsvImportForm
                    institution={selectedInstitution}
                    onCancel={this.resetSelection}
                  />
                }
              </Paper>
            }
          </div>
        </ClickAwayListener>
      </div>
    )
  }
}

ImportTransactionsComponent.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ImportTransactionsComponent)
