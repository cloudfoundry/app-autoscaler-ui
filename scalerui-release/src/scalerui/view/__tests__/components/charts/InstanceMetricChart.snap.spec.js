import MetricChart from '../../../src/components/charts/MetricChart'
import renderer from 'react-test-renderer'
import store from '../../../src/store'
import fs from 'fs'
import React from 'react'
import TestConstants from '../../TestConstants'
import { IntlProvider, intlShape } from 'react-intl'
import Locale from '../../../src/common/Locale'
import MetricsActions from '../../../src/actions/MetricsActions'
import ContainerActions from '../../../src/actions/ContainerActions'
import moment from 'moment'
import Util from '../../../src/common/Util'
import PolicyActions from '../../../src/actions/PolicyActions'

const policyFile = '__tests__/assets/policy/policy.json'
const metricsFile = '__tests__/assets/metrics/memoryused.json'
let policyData = JSON.parse(fs.readFileSync(policyFile))
let metricsData = JSON.parse(fs.readFileSync(metricsFile))

const startTime = moment(parseInt(metricsData.resources[0].collected_at / 1000000))
const endTime = moment(parseInt(metricsData.resources[metricsData.resources.length - 1].collected_at / 1000000))
const props = {
  selectedIndex: 0,
  metricName: 'memoryused',
  fromTime: startTime,
  toTime: endTime,
  refresh: false,
  intl: intlShape.isRequired,
}
const query = {
  'start-time': startTime * 1000000,
  'end-time': endTime * 1000000,
  'page': 1,
  'results-per-page': 10000000,
  'order': 'asc'
}

metricsData = JSON.parse(fs.readFileSync(metricsFile)).resources
const basicInfo = MetricsActions.getBasicInfo('memoryused', metricsData)
const interval = basicInfo.interval
const maxIndex = basicInfo.maxIndex
const unit = basicInfo.unit
const maxValue = basicInfo.maxValue
const transformedData = MetricsActions.transform(metricsData, interval, metricsData[0].collected_at, metricsData[metricsData.length - 1].collected_at)
store.dispatch(MetricsActions.getInstanceMetricsSuccess('memoryused', unit, maxIndex, maxValue, transformedData, query))
store.dispatch(ContainerActions.setAppId(TestConstants.appId))

describe('MetricChart', () => {
  const wrapper = renderer.create(
    <IntlProvider locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
      <MetricChart store={store} {...props} />
    </IntlProvider>
  )

  it.only('renders MetricChart component correctly -- no upper no lower', () => {
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it.only('renders MetricChart component correctly -- no upper', () => {
    let mapPolicy = Util.transformArrayToMap(policyData)
    delete mapPolicy.scaling_rules_map.memoryused['upper']
    store.dispatch(PolicyActions.getPolicySuccess(mapPolicy))
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it.only('renders MetricChart component correctly -- no lower', () => {
    let mapPolicy = Util.transformArrayToMap(policyData)
    delete mapPolicy.scaling_rules_map.memoryused['lower']
    store.dispatch(PolicyActions.getPolicySuccess(mapPolicy))
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it.only('renders MetricChart component correctly', () => {
    let mapPolicy = Util.transformArrayToMap(policyData)
    store.dispatch(PolicyActions.getPolicySuccess(mapPolicy))
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
  })

  afterAll(() => {
    wrapper.unmount()
  })

})
