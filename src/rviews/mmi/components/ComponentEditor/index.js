import Dialog from '@/components/Dialog'
import Constructor from './main'

export default function(option) {
  option = option || {}
  option.center = true
  Dialog.open(Constructor, option)
}
