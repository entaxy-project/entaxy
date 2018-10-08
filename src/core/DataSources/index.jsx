/* eslint no-console: 0 */
/* eslint-disable no-unused-vars */
import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import IconButton from '@material-ui/core/IconButton'
import CardActions from '@material-ui/core/CardActions'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import Paper from '@material-ui/core/Paper'
import Fade from '@material-ui/core/Fade'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import Button from '@material-ui/core/Button'
import Icon from '@mdi/react'
import { mdiFileUploadOutline, mdiUploadNetwork } from '@mdi/js'
import Header from '../../common/Header/index'
import CsvImport from './CsvImport'
import RbcLogo from './logos/RBC.png'
import BmoLogo from './logos/BMO.png'
import TdLogo from './logos/TD.png'
import TangerineLogo from './logos/Tangerine.png'
import QuestradeLogo from './logos/Questrade.png'

const styles = theme => ({
  root: {
    flexGrow: 1
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
    flex: '1 1 auto',
    'padding-left': '60px',
    'margin-left': '10px'
  },
  button: {
    'justify-content': 'flex-start',
    'font-size': '0.8rem',
    'min-width': '120px',
    align: 'left',
    'margin-bottom': '5px'
  },
  menuIcon: {
    marginRight: theme.spacing.unit
  },
  RBC: {
    background: `url(${RbcLogo}) left no-repeat`,
    'background-size': '50px'
  },
  BMO: {
    background: `url(${BmoLogo}) left no-repeat`,
    'background-size': '50px'
  },
  TD: {
    background: `url(${TdLogo}) left no-repeat`,
    'background-size': '50px'
  },
  Tangerine: {
    background: `url(${TangerineLogo}) left no-repeat`,
    'background-size': '50px'
  },
  Questrade: {
    background: `url(${QuestradeLogo}) left no-repeat`,
    'background-size': '50px'
  }
})

const institutions = {
  RBC: { importTypes: ['CSV'], description: 'Royal Bank' },
  BMO: { importTypes: ['CSV'], description: 'Bank of Montreal' },
  TD: { importTypes: ['CSV'], description: 'TD Canada Trust' },
  Tangerine: { importTypes: ['CSV'], description: 'Personal Banking' },
  Questrade: { importTypes: ['CSV', 'API'], description: 'Keep More of Your Money' }
}

export class DataSourcesComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null,
      open: false
    }
  }

  handleClick = institution => (event) => {
    const { currentTarget } = event
    this.setState(state => ({
      anchorEl: currentTarget,
      open: true,
      popupContent: (
        <MenuList role="menu">
          {_.map(institutions[institution].importTypes, importType => (
            <MenuItem key={importType}>
              <Icon
                path={(importType === 'CSV' ? mdiFileUploadOutline : mdiUploadNetwork)}
                size={1}
                className={this.props.classes.menuIcon}
              />
              {importType}
            </MenuItem>
          ))}
        </MenuList>
      )
    }))
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  render() {
    const { classes } = this.props
    const { anchorEl, open, popupContent } = this.state

    return (
      <ClickAwayListener onClickAway={this.handleClose}>
        <div>
          <Header />
          <Typography className={classes.title} variant="h5" align="center">
            Import transactions
          </Typography>
          <Popper open={open} anchorEl={anchorEl} placement="bottom-start" transition>
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <Paper>{popupContent}</Paper>
              </Fade>
            )}
          </Popper>
          <div className={classes.cards}>
            {_.map(institutions, (details, institution) => (
              <div key={institution}>
                <Card className={classes.card}>
                  <CardHeader
                    className={`${classes.cardHeader} ${classes[institution]}`}
                    title={institution}
                    subheader={details.description}
                    action={
                      <IconButton onClick={this.handleClick(institution)}>
                        <MoreVertIcon />
                      </IconButton>
                    }
                  />
                </Card>
              </div>
            ))}
          </div>
        </div>
      </ClickAwayListener>
    )
  }
}

DataSourcesComponent.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(DataSourcesComponent)
