/* eslint-disable react/no-multi-comp */
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
import CategoryForm from './form'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    flexDirection: 'column'
  },
  nested: {
    paddingLeft: theme.spacing(2)
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
  const [open, setOpen] = React.useState(budget.categoryTree.reduce(
    (result, category) => ({ ...result, [category.label]: true }),
    {}
  ))
  const [editCategory, setEditCategory] = React.useState(null)

  const handleClickTopCategoryArrow = (category) => {
    setOpen({ ...open, [category]: !open[category] })
  }

  const handleClickEditCategory = (categoryId) => {
    setEditCategory(categoryId)
  }

  const handleSaveCategory = (category) => {
    console.log(category)
    setEditCategory(null)
  }

  const handleCloseForm = (category) => {
    console.log(category)
    setEditCategory(null)
  }

  // const handleDeleteCategory = (category) => {
  //   setEditCategory(null)
  // }

  const filteredCategories = (topCategory) => {
    if (topCategory === undefined) {
      return budget.categoryTree
    }
    return budget.categoryTree.filter(cat => cat.label === topCategory)
  }

  const renderCategory = (category) => {
    if (editCategory !== null && category.id === editCategory) {
      return (
        <ListItem>
          <Paper>
            <CategoryForm
              category={category}
              handleSave={handleSaveCategory}
              handleDelete={handleSaveCategory}
              handleCancel={handleCloseForm}
            />
          </Paper>
        </ListItem>
      )
    }
    return (
      <ListItem>
        <ListItemIcon>
          <div
            className={classes.dot}
            style={{ background: category.colour }}
          />
        </ListItemIcon>
        <ListItemText primary={category.label} />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="Edit" onClick={() => handleClickEditCategory(category.id)}>
            <EditIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  return (
    <Grid container className={classes.root}>
      <Grid item xs={6}>
        <Typography variant="h5" gutterBottom={true}>Budget categories</Typography>
        <Paper className={classes.list}>
          <List
            aria-labelledby="nested-list-subheader"
            className={classes.list}
            dense
          >
            {filteredCategories().map(topCategory => (
              <div key={topCategory.id}>
                <ListItem button onClick={() => handleClickTopCategoryArrow(topCategory.label)}>
                  <ListItemIcon><FolderIcon /></ListItemIcon>
                  <ListItemText primary={topCategory.label} primaryTypographyProps={{ variant: 'subtitle2' }} />
                  {open[topCategory.label] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open[topCategory.label]} timeout="auto" unmountOnExit>
                  {topCategory.options.map(category => (
                    <List disablePadding dense key={category.id} className={classes.nested}>
                      {renderCategory(category)}
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
