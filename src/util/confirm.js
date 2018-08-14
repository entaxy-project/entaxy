import { createConfirmation } from 'react-confirm'
import ConfirmDialog from '../common/ConfirmDialog'

const confirm = createConfirmation(ConfirmDialog)

export default function (title, description) {
  return confirm({ title, description })
}
