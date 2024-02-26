import defaultSettings from '@/settings'
import i18n from '@/lang'

const title = defaultSettings.title || 'Rubik'

export default function getPageTitle(key) {
  const hasKey = i18n.te(key)
  if (hasKey) {
    const pageName = i18n.t(key)
    return `${pageName || key} - ${title}`
  }
  return `${title}`
}
