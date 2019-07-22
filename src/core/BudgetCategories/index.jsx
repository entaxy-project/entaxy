import React from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Collapse from '@material-ui/core/Collapse'
import Typography from '@material-ui/core/Typography'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import FolderIcon from '@material-ui/icons/Folder'
import EditIcon from '@material-ui/icons/Edit'
import IconButton from '@material-ui/core/IconButton'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    flexDirection: 'column'
  },
  nested: {
    paddingLeft: theme.spacing(3)
  },
  dot: {
    borderRadius: 4,
    content: '" "',
    display: 'block',
    marginRight: -10,
    marginLeft: 10,
    height: 15,
    width: 15
  }
}))

const BudgetCategories = () => {
  const classes = useStyles()
  const budget = useSelector(state => state.budget)
  const [open, setOpen] = React.useState(budget.categories.reduce(
    (result, category) => ({ ...result, [category.label]: true }),
    {}
  ))

  function handleClick(category) {
    setOpen({ ...open, [category]: !open[category] })
  }

  return (
    <Grid container className={classes.root}>
      <Grid item xs={6}>
        <Typography variant="h5" gutterBottom={true}>Budget categories</Typography>
        <Paper className={classes.list}>
          <List
            aria-labelledby="nested-list-subheader"
            className={classes.list}
          >
            {budget.categories.map(topCategory => (
              <div key={topCategory.label}>
                <ListItem button onClick={() => handleClick(topCategory.label)}>
                  <ListItemIcon><FolderIcon /></ListItemIcon>
                  <ListItemText primary={topCategory.label} />
                  {open[topCategory.label] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open[topCategory.label]} timeout="auto" unmountOnExit>
                  {topCategory.options.map(category => (
                    <List disablePadding dense={true} key={category.label}>
                      <ListItem button className={classes.nested}>
                        <ListItemIcon>
                          <div
                            className={classes.dot}
                            style={{
                              background: budget.colours[category.label]
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText primary={category.label} />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" aria-label="Delete">
                            <EditIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  ))}
                </Collapse>
              </div>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default BudgetCategories
