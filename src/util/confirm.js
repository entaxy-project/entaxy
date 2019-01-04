import { createConfirmation } from 'react-confirm'
import ConfirmDialog from '../common/ConfirmDialog'

const confirm = createConfirmation(ConfirmDialog)

export default (title, description) => confirm({ title, description })
