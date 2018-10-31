import HistoryTable from '../../../src/components/tables/HistoryTable'
import renderer from 'react-test-renderer'
import HistoryActions from '../../../src/actions/HistoryActions'
import store from '../../../src/store'
import fs from 'fs'
import React from 'react'
import TestConstants from '../../TestConstants'
import moment from 'moment-timezone'

const historyFile = '__tests__/assets/history/history.json'
const historyData = JSON.parse(fs.readFileSync(historyFile))
const selectedOptions = {
  range: {
    typeIndex: 0,
    from: 0,
    to: 0
  },
  timezoneIndex: moment.tz.names().indexOf(TestConstants.timezone),
  scalingStatusIndex: 0,
  scalingTypeIndex: 0,
  scalingActionIndex: 0,
  perPage: 10
}
store.dispatch(HistoryActions.setHistoryOptions(selectedOptions))
store.dispatch(HistoryActions.getHistorySuccess(historyData))

describe('HistoryTable', () => {
  it.only('renders HistoryTable component correctly', () => {
    const wrapper = renderer.create(
      <HistoryTable store={store} />
    )
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
    wrapper.unmount()
  })
})
