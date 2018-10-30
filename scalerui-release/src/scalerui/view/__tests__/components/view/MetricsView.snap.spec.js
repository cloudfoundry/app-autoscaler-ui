import MetricsView from '../../../src/components/view/MetricsView'
import renderer from 'react-test-renderer'
import MetricsActions from '../../../src/actions/MetricsActions'
import store from '../../../src/store'
import fs from 'fs'
import React from 'react'
import moment from 'moment'
import Constants from '../../../src/constants/Constants'

const initialSelectedOptions = {
  metrics: ['memoryused'],
  instance: 'mean',
  rangeSelect: 'custom',
  rangeSubmit: 'custom',
  custom: {
    from: moment('2018-05-30 17:00:00'),
    to: moment('2018-05-30 18:00:00')
  }
}
const initialQuery = {
  'start-time': initialSelectedOptions.custom.from * 1000000,
  'end-time': initialSelectedOptions.custom.to * 1000000,
  page: 1,
  'results-per-page': Constants.metricsPerPage,
  order: 'asc'
}
store.dispatch(MetricsActions.setMetricsOptions(initialSelectedOptions))

const metricsFile = '__tests__/assets/metrics/memoryused.json'
const metricsData = JSON.parse(fs.readFileSync(metricsFile)).resources
const basicInfo = MetricsActions.getBasicInfo('memoryused', metricsData)
const interval = basicInfo.interval
const maxIndex = basicInfo.maxIndex
const unit = basicInfo.unit
const maxValue = basicInfo.maxValue
const transformedData = MetricsActions.transform(metricsData, interval, metricsData[0].collected_at, metricsData[metricsData.length - 1].collected_at)
store.dispatch(MetricsActions.getInstanceMetricsSuccess('memoryused', unit, maxIndex, maxValue, transformedData))

describe('MetricsView', () => {
  it.skip('renders MetricsView component correctly', () => {
    const wrapper = renderer.create(
        <MetricsView store={store} />
    )
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
    wrapper.unmount()
  })
})
