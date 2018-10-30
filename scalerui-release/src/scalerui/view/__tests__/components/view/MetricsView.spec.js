import nock from 'nock'
import MetricsView from '../../../src/components/view/MetricsView'
import ContainerActions from '../../../src/actions/ContainerActions'
import store from '../../../src/store'
import React from 'react'
import TestConstants from '../../TestConstants'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Util from '../../../src/common/Util'
import Constants from '../../../src/constants/Constants'
import fs from 'fs'
import moment from 'moment-timezone'
import MetricsActions from '../../../src/actions/MetricsActions'

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

const targetSelectedOptions1 = {
  metrics: ['memoryused'],
  instance: 2,
  rangeSelect: 'custom',
  rangeSubmit: 'custom',
  custom: {
    from: moment('2018-05-30 17:00:00'),
    to: moment('2018-05-30 18:00:00')
  }
}
const targetFromDateTime = '2018-05-20 01:00:00'
const targetToDateTime = '2018-05-20 02:00:00'
const targetSelectedOptions2 = {
  metrics: ['memoryused'],
  instance: 2,
  rangeSelect: 'custom',
  rangeSubmit: 'custom',
  custom: {
    from: moment(targetFromDateTime),
    to: moment(targetToDateTime)
  },
  submitted: false
}
const targetQuery1 = {
  'start-time': moment(targetFromDateTime) * 1000000,
  'end-time': moment(targetToDateTime) * 1000000,
  page: 1,
  'results-per-page': Constants.metricsPerPage,
  order: 'asc'
}
const targetSelectedOptions3 = {
  metrics: ['memoryused', 'responsetime', 'throughput'],
  instance: 2,
  rangeSelect: 'custom',
  rangeSubmit: 'custom',
  custom: {
    from: moment(targetFromDateTime),
    to: moment(targetToDateTime)
  },
  submitted: false
}
const metricsFile = '__tests__/assets/metrics/memoryused.json'
let metricsData = JSON.parse(fs.readFileSync(metricsFile))
const basicInfo = MetricsActions.getBasicInfo('memoryused', metricsData.resources)

store.dispatch(ContainerActions.setAppId(TestConstants.appId))
store.dispatch(MetricsActions.setMetricsOptions(initialSelectedOptions))
nock(Constants.restUrl_base).get(Constants.restUrl_appMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', Constants.MetricTypes[0])).query(initialQuery).reply(200, metricsData)
nock(Constants.restUrl_base).get(Constants.restUrl_instanceMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', Constants.MetricTypes[0])).query(initialQuery).reply(200, metricsData)
nock(Constants.restUrl_base).get(Constants.restUrl_instanceMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', Constants.MetricTypes[0])).query(initialQuery).reply(200, metricsData)
nock(Constants.restUrl_base).get(Constants.restUrl_appMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', Constants.MetricTypes[0])).query(targetQuery1).reply(200, metricsData)
nock(Constants.restUrl_base).get(Constants.restUrl_instanceMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', Constants.MetricTypes[0])).query(targetQuery1).reply(200, metricsData)
nock(Constants.restUrl_base).get(Constants.restUrl_appMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', Constants.MetricTypes[0])).query(targetQuery1).reply(200, metricsData)
nock(Constants.restUrl_base).get(Constants.restUrl_instanceMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', Constants.MetricTypes[0])).query(targetQuery1).reply(200, metricsData)
nock(Constants.restUrl_base).get(Constants.restUrl_appMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', Constants.MetricTypes[2])).query(targetQuery1).reply(200, metricsData)
nock(Constants.restUrl_base).get(Constants.restUrl_instanceMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', Constants.MetricTypes[2])).query(targetQuery1).reply(200, metricsData)
metricsData.resources.push({
  'app_id': 'a2eecfe3-8c4d-494f-aec5-01bfb7f9f906',
  'instance_index': 15,
  'collected_at': 1526378037682252800,
  'name': 'memoryused',
  'unit': 'MB',
  'value': '20',
  'timestamp': 1526378036729008000
})
nock(Constants.restUrl_base).get(Constants.restUrl_instanceMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', Constants.MetricTypes[3])).query(targetQuery1).reply(200, metricsData)

configure({ adapter: new Adapter() })

const setup = () => {
  const wrapper = mount(
    <MetricsView store={store} />
  )
  return wrapper
}

const fillin = (dom, text) => {
  dom.simulate('change', { target: { value: text, type: 'number' } })
}

describe('MetricsView function test', () => {

  const wrapper = setup()

  describe('Load data of specified period', () => {
    it('load succeed', (done) => {
      setTimeout(() => {
        wrapper.update()
        expect(wrapper.find('.metrics-view').find('.bx--row').length).toBe(4)
        done()
      }, 100)
    })
  })

  describe('Change Application Instance', () => {
    it('change instance from "mean" to "2"', (done) => {
      expect(wrapper.find('.bx--dropdown').length).toBe(8)
      wrapper.find('.bx--dropdown').at(0).find('.bx--list-box__menu-icon').simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(basicInfo.maxIndex + 2)
      wrapper.find('.bx--list-box__menu-item').at(3).simulate('click')
      setTimeout(() => {
        expect(Util.isEqual(JSON.stringify(store.getState().metricsData.get('selected_options').toJS()), JSON.stringify(targetSelectedOptions1))).toBe(true)
        done()
      }, 100)
    })
  })

  describe('Change Time Scope', () => {
    it('change instance from "mean" to "2"', () => {
      wrapper.find('.bx--dropdown').at(2).find('.bx--list-box__menu-icon').simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(4)
      wrapper.find('.bx--list-box__menu-item').at(3).simulate('click')

      fillin(wrapper.find('.bx--date-picker').at(0).find('input'), moment(targetFromDateTime).format(Constants.MomentFormateDate))
      wrapper.find('.bx--dropdown').at(4).find('.bx--list-box__menu-icon').at(0).simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(24)
      wrapper.find('.bx--list-box__menu-item').at(1).simulate('click')

      fillin(wrapper.find('.bx--date-picker').at(1).find('input'), moment(targetFromDateTime).format(Constants.MomentFormateDate))
      wrapper.find('.bx--dropdown').at(6).find('.bx--list-box__menu-icon').at(0).simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(24)
      wrapper.find('.bx--list-box__menu-item').at(2).simulate('click')
    })

    it('submit', (done) => {
      wrapper.find('.bx--btn--primary').at(0).simulate('click')
      setTimeout(() => {
        expect(Util.isEqual(JSON.stringify(store.getState().metricsData.get('selected_options').toJS()), JSON.stringify(targetSelectedOptions2))).toBe(true)
        done()
      }, 1000)
    })
  })

  describe('Add metrics', () => {
    it('add metrics', (done) => {
      wrapper.find('.bx--list-box__menu-icon').at(0).simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(Constants.MetricTypes.length)
      wrapper.find('.bx--list-box__menu-item').at(2).simulate('click')
      wrapper.find('.bx--list-box__menu-item').at(3).simulate('click')
      setTimeout(() => {
        wrapper.update()
        expect(Util.isEqual(JSON.stringify(store.getState().metricsData.get('selected_options').toJS()), JSON.stringify(targetSelectedOptions3))).toBe(true)
        expect(wrapper.find('.metrics-view').find('.bx--row').length).toBe(7)
        done()
      }, 100)
    })
  })

  afterAll(() => {
    wrapper.unmount()
  })

})