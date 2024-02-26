import Dialog from '@/components/Dialog'
import Constructor from './main'

export default function(option) {
  option = option || {}
  if (!option.value) option.value = ''
  Dialog.open(Constructor, option)
}
