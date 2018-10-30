import nock from 'nock'
import HistoryView from '../../../src/components/view/HistoryView'
import ContainerActions from '../../../src/actions/ContainerActions'
import store from '../../../src/store'
import React from 'react'
import TestConstants from '../../TestConstants'
import Locale from '../../../src/common/Locale'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Util from '../../../src/common/Util'
import Constants from '../../../src/constants/Constants'
import fs from 'fs'
import moment from 'moment-timezone'

const initialQuery = {
  'start-time': moment().subtract(1, 'weeks').add(1, 'days').startOf('day') * 1000000,
  'end-time': moment().add(1, 'days').startOf('day') * 1000000,
  page: 1,
  'results-per-page': 10,
  order: 'desc'
}
const targetQuery1 = {
  'start-time': 1514786400000000000,
  'end-time': 1517504400000000000,
  page: 1,
  'results-per-page': 10,
  order: 'desc'
}
const targetQuery2 = {
  'start-time': 1514786400000000000,
  'end-time': 1517504400000000000,
  page: 2,
  'results-per-page': 10,
  order: 'desc'
}
const targetQuery3 = {
  'start-time': 1514786400000000000,
  'end-time': 1517504400000000000,
  page: 1,
  'results-per-page': 50,
  order: 'desc'
}
const historyFile = '__tests__/assets/history/history.json'
const historyData = JSON.parse(fs.readFileSync(historyFile))
store.dispatch(ContainerActions.setAppId(TestConstants.appId))
nock(Constants.restUrl_base).get(Constants.restUrl_appHistory.replace('APP_ID', TestConstants.appId)).query(initialQuery).reply(200, historyData)
nock(Constants.restUrl_base).get(Constants.restUrl_appHistory.replace('APP_ID', TestConstants.appId)).query(targetQuery1).reply(200, historyData)
nock(Constants.restUrl_base).get(Constants.restUrl_appHistory.replace('APP_ID', TestConstants.appId)).query(targetQuery2).reply(200, historyData)
nock(Constants.restUrl_base).get(Constants.restUrl_appHistory.replace('APP_ID', TestConstants.appId)).query(targetQuery3).reply(200, historyData)

configure({ adapter: new Adapter() })

const setup = () => {
  const wrapper = mount(
    <Provider store={store}>
      <IntlProvider locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
        <HistoryView />
      </IntlProvider>
    </Provider>
  )
  return wrapper
}

const fillin = (dom, text) => {
  dom.simulate('change', { target: { value: text, type: 'number' } })
}

describe('HistoryView function test', () => {

  const wrapper = setup()

  describe('Load data', () => {
    it('initial load last 7 days data succeed', (done) => {
      setTimeout(() => {
        wrapper.update()
        expect(wrapper.find('tbody').find('tr').length).toBe(historyData.resources.length)
        done()
      }, 100)
    })
  })

  describe('Change query', () => {
    it('change Time Zone from default to America/New_York(-5)', () => {
      let targetTimezone = 'America/New_York'
      wrapper.find('.bx--list-box__menu-icon').at(0).simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(moment.tz.names().length)
      wrapper.find('.bx--list-box__menu-item').at(moment.tz.names().indexOf(targetTimezone)).simulate('click')
    })

    it('change Query Range from default to 2018-01-01 01:00 ~ 2018-02-01 12:00', () => {
      wrapper.find('.bx--list-box__menu-icon').at(1).simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(3)
      wrapper.find('.bx--list-box__menu-item').at(2).simulate('click')

      // fillin(wrapper.find('.bx--date-picker').at(0).find('input'), '2018-01-01')
      wrapper.find('.bx--list-box__menu-icon').at(2).simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(24)
      wrapper.find('.bx--list-box__menu-item').at(1).simulate('click')

      // fillin(wrapper.find('.bx--date-picker').at(1).find('input'), '2018-02-01')
      wrapper.find('.bx--list-box__menu-icon').at(3).simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(24)
      wrapper.find('.bx--list-box__menu-item').at(12).simulate('click')
    })

    it('change Scaling Status from Any to Succeed', () => {
      wrapper.find('.bx--list-box__menu-icon').at(4).simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(4)
      wrapper.find('.bx--list-box__menu-item').at(1).simulate('click')
    })

    it('change Scaling Type from Any to Schedule', () => {
      wrapper.find('.bx--list-box__menu-icon').at(5).simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(3)
      wrapper.find('.bx--list-box__menu-item').at(2).simulate('click')
    })

    it('change Scaling Action from Any to Scalt In', () => {
      wrapper.find('.bx--list-box__menu-icon').at(6).simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(3)
      wrapper.find('.bx--list-box__menu-item').at(1).simulate('click')
    })

    it('submit and query', (done) => {
      wrapper.find('.bx--btn--primary').at(0).simulate('click')
      setTimeout(() => {
        expect(Util.isEqual(store.getState().historyData.get('app_history_query').toJS(), targetQuery1))
        done()
      }, 100)
    })
  })

  describe('Change page and per page', () => {

    it.skip('change page', (done) => {
      expect(wrapper.find('.pagination').at(0).find('li').length).toBe(7 + historyData.total_pages)
      wrapper.find('.pagination').at(0).find('li').at(4).simulate('click')
      setTimeout(() => {
        expect(Util.isEqual(store.getState().historyData.get('app_history_query').toJS(), targetQuery2)).toBe(true)
        done()
      }, 100)
    })

    it.skip('change per page', (done) => {
      expect(wrapper.find('.pagination').at(1).find('li').length).toBe(5)
      wrapper.find('.pagination').at(1).find('li').at(3).simulate('click')
      setTimeout(() => {
        expect(Util.isEqual(store.getState().historyData.get('app_history_query').toJS(), targetQuery3))
        done()
      }, 100)
    })

  })

  afterAll(() => {
    wrapper.unmount()
  })

})