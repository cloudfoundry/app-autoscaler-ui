import zh from 'react-intl/locale-data/zh'
import en from 'react-intl/locale-data/en'
import zh_CN from '../constants/AutoscalingNLS/nls/zh/ScalingMessages'
import en_US from '../constants/AutoscalingNLS/nls/ScalingMessages'
import { addLocaleData } from 'react-intl'

addLocaleData([...en, ...zh])

let Locale = {
  getLocale(language) {
    switch (language) {
      case 'en-US':
        return en_US
      case 'zh-CN':
        return zh_CN
      default:
        return en_US
    }
  }
}

export default Locale
