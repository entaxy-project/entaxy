/* eslint-disable react/no-multi-comp */
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import InputBase from '@material-ui/core/InputBase'
import InputAdornment from '@material-ui/core/InputAdornment'
import Typography from '@material-ui/core/Typography'
import SearchIcon from '@material-ui/icons/Search'
import AddIcon from '@material-ui/icons/Add'
import InfoIcon from '@material-ui/icons/Info'
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import Select from 'react-select'
import { fade } from '@material-ui/core/styles/colorManipulator'
import Tooltip from '@material-ui/core/Tooltip'
import pluralize from 'pluralize'
import CategoryForm from './form'
import { currencyFormatter } from '../../util/stringFormatter'
import { deleteCategory } from '../../store/budget/actions'
import GroupDialog from './GroupDialog'
import confirm from '../../util/confirm'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(6)
  },
  categoryGroup: {
    marginTop: theme.spacing(2)
  },
  groupName: {
    display: 'inline-block',
    marginRight: theme.spacing(1)
  },
  circle: {
    borderRadius: 20,
    content: '" "',
    display: 'block',
    marginRight: 10,
    marginLeft: 10,
    height: 30,
    width: 30
  },
  newCategoryButton: {
    marginTop: theme.spacing(2),
    textAlign: 'center'
  },
  inputRoot: {
    verticalAlign: 'bottom',
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1) * 0.5,
    paddingBottom: theme.spacing(1) * 0.5,
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: fade(theme.palette.grey[400], 0.15),
    marginRight: theme.spacing(2),
    marginLeft: 0,
    '&:hover': {
      backgroundColor: fade(theme.palette.grey[400], 0.25)
    }
  },
  inputInput: {
    width: 160,
    color: 'inherit',
    transition: theme.transitions.create('width')
  },
  filterParentCategory: {
    width: 230,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
    display: 'inline-block'
  },
  infoIcon: {
    color: theme.palette.info.text,
    fontSize: 18,
    verticalAlign: 'text-bottom'
  },
  categoryName: {
    wordBreak: 'break-word'
  }
}))


const BudgetCategories = () => {
  const classes = useStyles()
  const { budget, formatCurrency } = useSelector((state) => ({
    budget: state.budget,
    formatCurrency: currencyFormatter(state.settings.locale, state.settings.currency)
  }))
  const dispatch = useDispatch()

  const [filter, setfilter] = React.useState({
    category: '',
    parentCategoryId: ''
  })
  const [popupCategoryId, setPopupCategoryId] = React.useState(null)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [editCategory, setEditCategory] = React.useState(null)
  const [openGroupDialog, setOpenGroupDialog] = React.useState(false)
  const [selectedGroup, setSelectedGroup] = React.useState(null)
  const popupIsOpen = Boolean(anchorEl)

  // --- Filters ----
  function handleFilterChange(event) {
    if ('persist' in event) event.persist()
    setfilter((oldValues) => ({
      ...oldValues,
      [event.target.name]: event.target.value
    }))
  }

  const filteredCategories = () => (
    budget.categoryTree.reduce((res, cat) => {
      if (filter.parentCategoryId === '' || cat.id === filter.parentCategoryId) {
        let categoryList = cat.options
        if (filter.category !== '') {
          categoryList = cat.options.filter((category) => (
            category.label.toLowerCase().includes(filter.category.toLowerCase())
          ))
          if (categoryList.length === 0) return res
        }
        // The income group goes at the top
        if (cat.isIncome) {
          return [{ ...cat, options: categoryList }, ...res]
        }
        return [...res, { ...cat, options: categoryList }]
      }
      return res
    }, [])
  )

  // --- Popuop ---
  const handleClosePopup = () => {
    setAnchorEl(null)
  }

  const handleOpenPopup = (event, categoryId) => {
    setAnchorEl(popupCategoryId === categoryId && popupIsOpen ? null : event.currentTarget)
    setPopupCategoryId(categoryId)
    setEditCategory(null)
  }

  // --- Category form ---
  const showNewCategoryForm = (groupId) => {
    setEditCategory(groupId)
    setAnchorEl(null)
  }

  const showEditCategoryForm = () => {
    setEditCategory(popupCategoryId)
    setAnchorEl(null)
  }

  const handleCloseForm = () => {
    setEditCategory(null)
  }

  const handleDeleteCategory = () => {
    const category = budget.categoriesById[popupCategoryId]
    let confirmText = 'Are you sure?'
    const transactionsCount = Object.values(budget.rules).reduce((count, rule) => (
      rule.categoryId === category.id ? count + rule.count : count
    ), 0)
    if (transactionsCount > 0) {
      confirmText += ` There will be ${pluralize('transaction', transactionsCount, true)} affected.`
    }
    confirm(`Delete ${category.name}.`, confirmText).then(async () => {
      dispatch(deleteCategory(popupCategoryId))
    })
    handleClosePopup()
  }

  // --- Group dialog ---
  const handleNewGroup = () => {
    setSelectedGroup(null)
    setOpenGroupDialog(true)
  }

  const handleEditGroup = (category) => {
    setSelectedGroup(budget.categoriesById[category.id])
    setOpenGroupDialog(true)
  }

  const handleDeleteGroup = (category) => {
    let title = `Delete ${category.label} group`
    const childCategoryIds = category.options.map((item) => item.id)
    if (category.options.length > 0) {
      title += ` and ${pluralize('categories', category.options.length, true)}.`
    }
    let confirmText = 'Are you sure?'
    const transactionsCount = Object.values(budget.rules).reduce((count, rule) => (
      rule.categoryId === category.id || childCategoryIds.includes(rule.categoryId) ? count + rule.count : count
    ), 0)
    if (transactionsCount > 0) {
      confirmText += ` There will be ${pluralize('transaction', transactionsCount, true)} affected.`
    }
    confirm(title, confirmText).then(async () => {
      dispatch(deleteCategory(category.id))
    })
  }

  const handleCloseGroupDialog = () => {
    setSelectedGroup(null)
    setOpenGroupDialog(false)
  }

  const renderCategory = (categoryId) => {
    const category = budget.categoriesById[categoryId]
    const group = budget.categoriesById[category.parentId]
    if (editCategory !== null && categoryId === editCategory) {
      return (
        <CategoryForm
          category={category}
          group={group}
          handleCancel={handleCloseForm}
        />
      )
    }
    return (
      <CardHeader
        classes={{ title: classes.categoryName }}
        avatar={<div className={classes.circle} style={{ background: category.colour }} />}
        action={(
          <IconButton aria-label="settings" onClick={(event) => handleOpenPopup(event, category.id)}>
            <MoreVertIcon />
          </IconButton>
        )}
        title={category.name}
        subheader={
          !group.isIncome
          && `Budget limit: ${category.budgetLimit ? formatCurrency(category.budgetLimit) : 'Not set'}`
        }
        subheaderTypographyProps={{
          variant: 'caption'
        }}
      />
    )
  }

  const renderNewCategory = (groupId) => {
    const group = budget.categoriesById[groupId]
    if (editCategory !== null && groupId === editCategory) {
      return (
        <Card>
          <CategoryForm
            group={group}
            handleCancel={handleCloseForm}
          />
        </Card>
      )
    }
    return (
      <Button size="small" color="secondary" onClick={() => showNewCategoryForm(groupId)}>
        New category
        <AddIcon />
      </Button>
    )
  }

  return (
    <Container className={classes.root}>
      <GroupDialog
        open={openGroupDialog}
        onCancel={handleCloseGroupDialog}
        category={selectedGroup}
      />
      <Grid container justify="space-between">
        <Typography variant="h4">Manage categories</Typography>
        <div>
          <InputBase
            type="search"
            placeholder="Search categories"
            name="category"
            onChange={handleFilterChange}
            value={filter.category}
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput
            }}
            inputProps={{
              'aria-label': 'Search categories',
              maxLength: 20
            }}
            startAdornment={<InputAdornment position="start"><SearchIcon /></InputAdornment>}
          />
          <Select
            placeholder="All groups"
            name="parentCategoryId"
            value={
              filter.parentCategoryId in budget.categoriesById
                ? {
                  label: budget.categoriesById[filter.parentCategoryId].name,
                  value: filter.parentCategoryId
                }
                : null
            }
            options={budget.categoryTree.map((cat) => ({ label: cat.label, value: cat.id }))}
            inputProps={{ 'aria-label': 'All categories' }}
            onChange={(value) => {
              handleFilterChange({
                target: {
                  name: 'parentCategoryId',
                  value: value === null ? '' : value.value
                }
              })
            }}
            className={classes.filterParentCategory}
            isClearable
          />
          <Tooltip title="New Group">
            <IconButton aria-label="New Group" onClick={handleNewGroup}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Grid>
      {filteredCategories().map((group) => (
        <Grid container spacing={2} key={group.id} className={classes.categoryGroup}>
          <Grid item xs={12}>
            <Typography variant="h6" className={classes.groupName}>{group.label}</Typography>
            {group.isIncome && (
              <Tooltip title="The Income group cannot be edited or removed">
                <InfoIcon className={classes.infoIcon} />
              </Tooltip>
            )}
            {!group.isIncome && (
              <>
                <IconButton
                  disabled={group.isIncome}
                  aria-label="Change group name"
                  onClick={() => handleEditGroup(group)}
                  style={{ padding: 8 }}
                >
                  <Tooltip title="Change group name">
                    <EditIcon style={{ fontSize: 18 }} />
                  </Tooltip>
                </IconButton>
                <IconButton
                  disabled={group.isIncome}
                  aria-label="Delete group"
                  onClick={() => handleDeleteGroup(group)}
                  style={{ padding: 8 }}
                >
                  <Tooltip title="Delete group">
                    <DeleteIcon style={{ fontSize: 18 }} />
                  </Tooltip>
                </IconButton>
              </>
            )}
          </Grid>
          {group.options.map((category) => (
            <Grid item lg={3} md={4} sm={6} xs={12} key={category.id}>
              <Card>{renderCategory(category.id)}</Card>
            </Grid>
          ))}
          <Grid
            item
            lg={3}
            md={4}
            sm={6}
            xs={12}
            key={`add-new-${group.id}`}
            className={classes.newCategoryButton}
          >
            {renderNewCategory(group.id)}
          </Grid>
        </Grid>
      ))}
      <Menu anchorEl={anchorEl} open={popupIsOpen} onClose={handleClosePopup}>
        <MenuList role="menu">
          <MenuItem onClick={showEditCategoryForm}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>
          <MenuItem onClick={handleDeleteCategory}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </MenuList>
      </Menu>
    </Container>
  )
}

export default BudgetCategories
