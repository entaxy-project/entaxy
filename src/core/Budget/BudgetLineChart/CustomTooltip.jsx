import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2)
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: theme.spacing(1)
  },
  label: {
    fontSize: 12,
    align: 'left',
    flexGrow: 1,
    marginRight: theme.spacing(1)
  },
  value: {
    fontSize: 12,
    textAlign: 'right'
  }
}))


const CustomTootip = (props) => {
  const classes = useStyles()
  const { label, payload, formatter } = props

  return (
    <Paper className={classes.root}>
      <Typography variant="subtitle1">{label}</Typography>
      { payload.sort((a, b) => b.value - a.value).map((item) => (
        <div key={item.dataKey} className={classes.item}>
          <div className={classes.dot} style={{ backgroundColor: item.color }} />
          <div className={classes.label}>{item.dataKey}</div>
          <div className={classes.value}>{formatter(item.value)}</div>
        </div>
      ))}
    </Paper>
  )
}

CustomTootip.propTypes = {
  label: PropTypes.string,
  payload: PropTypes.array,
  formatter: PropTypes.func
}

CustomTootip.defaultProps = {
  label: undefined,
  payload: undefined,
  formatter: undefined
}

export default CustomTootip
