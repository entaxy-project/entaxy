import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import AccountBalanceIcon from '@material-ui/icons/AccountBalance'
import Icon from '@mdi/react'
import { mdiAccountCash } from '@mdi/js'
import { institutions } from '../../data/institutions'
import { accountTypes } from '../../store/accounts/reducer'

const styles = () => ({
  small: {
    fontSize: 20,
    width: 20,
    height: 20,
    verticalAlign: 'bottom'
  },
  medium: {
    width: 30,
    height: 30
  }
})

const InstitutionIcon = ({
  classes,
  className,
  institution,
  size
}) => {
  let type
  if (institution in institutions.fiat) {
    type = 'fiat'
  }
  if (institution in institutions.crypto) {
    type = 'crypto'
  }
  if (type) {
    const { favicon, name } = institutions[type][institution]
    return (
      <img
        src={favicon}
        alt={name}
        className={`${[classes[size], className].join(' ')}`}
      />
    )
  }
  if (institution === accountTypes.cash) {
    return (
      <Icon
        path={mdiAccountCash}
        title="User Profile"
        size={1}
        color="rgba(0, 0, 0, 0.54)"
        className={`${[classes[size], className].join(' ')}`}
      />
    )
  }
  return <AccountBalanceIcon className={`${[classes[size], className].join(' ')}`} />
}

InstitutionIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  institution: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired
}

InstitutionIcon.defaultProps = {
  className: undefined
}

export default withStyles(styles)(InstitutionIcon)
