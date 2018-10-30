import HistoryTable from '../../../src/components/tables/HistoryTable'
import renderer from 'react-test-renderer'
import HistoryActions from '../../../src/actions/HistoryActions'
import store from '../../../src/store'
import fs from 'fs'
import React from 'react'

const historyFile = '__tests__/assets/history/history.json'
const historyData = JSON.parse(fs.readFileSync(historyFile))
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
