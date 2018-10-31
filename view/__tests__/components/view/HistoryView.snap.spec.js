import HistoryView from '../../../src/components/view/HistoryView'
import renderer from 'react-test-renderer'
import HistoryActions from '../../../src/actions/HistoryActions'
import store from '../../../src/store'
import fs from 'fs'
import React from 'react'
import Util from '../../../src/common/Util'
import Locale from '../../../src/common/Locale'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import moment from 'moment'

const historyFile = '__tests__/assets/history/history.json'
const historyData = JSON.parse(fs.readFileSync(historyFile))
store.dispatch(HistoryActions.getHistorySuccess(historyData, {}))
store.dispatch(HistoryActions.setHistoryOptions({
  range:
    {
      typeIndex: 2,
      from: moment('2018-01-01T01:00:00.000'),
      to: moment('2018-02-01T12:00:00.000')
    },
  timezoneIndex: 168,
  scalingStatusIndex: 1,
  scalingTypeIndex: 2,
  scalingActionIndex: 1,
  perPage: '50'
}))

describe('HistoryView', () => {
  it.skip('renders HistoryView component correctly', () => {
    const wrapper = renderer.create(
      <Provider store={store}>
        <IntlProvider locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
          <HistoryView />
        </IntlProvider>
      </Provider>
    )
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
    wrapper.unmount()
  })
})
