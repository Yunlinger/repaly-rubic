import Dialog from '@/components/Dialog'
import Constructor from './main'

export default function(option) {
  option = option || {}
  option.center = true
  if (!option.dyn) option.dyn = {}
  if (!option.dyn.exprs) option.dyn.exprs = []
  Dialog.open(Constructor, option)
}
