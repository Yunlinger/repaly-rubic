import Dialog from '@/components/Dialog'
import Constructor from './main.vue'

export default function(option) {
  option = option || {}
  option.color = option.color || '0xFFFFFFFF'
  Dialog.open(Constructor, option)
}
