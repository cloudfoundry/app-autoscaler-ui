import React from 'react'
import nock from 'nock'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ContainerPage from '../../../src/components/pages/ContainerPage'
import TestConstants from '../../TestConstants'
import Constants from '../../../src/constants/Constants'
import ContainerActions from '../../../src/actions/ContainerActions'
import store from '../../../src/store'
import Locale from '../../../src/common/Locale'
import Util from '../../../src/common/Util'
import MetricTypeUtil from '../../../src/common/MetricTypeUtil'
import fs from 'fs'
import moment from 'moment-timezone'

configure({ adapter: new Adapter() })
nock(Constants.restUrl_base).get(Constants.restUrl_serviceBoundApps.replace('SERVICE_ID', TestConstants.serviceId)).reply(200, TestConstants.fakeBoundApps);
nock(Constants.restUrl_base).get(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.appId)).reply(200, TestConstants.fullPolicy);
nock(Constants.restUrl_base).get(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.fakeBoundApps.applications[0].app_guid)).reply(200, TestConstants.fullPolicy);
nock(Constants.restUrl_base).get(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.fakeBoundApps.applications[1].app_guid)).reply(404, {});
nock(Constants.restUrl_base).put(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.fakeBoundApps.applications[1].app_guid), TestConstants.defaultPolicy).reply(200, TestConstants.defaultPolicy);
nock(Constants.restUrl_base).get(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.fakeBoundApps.applications[2].app_guid)).reply(403, TestConstants.responseBody403);
nock(Constants.restUrl_base).get(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.fakeBoundApps.applications[3].app_guid)).reply(200, TestConstants.fullPolicy);
nock(Constants.restUrl_base).delete(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.fakeBoundApps.applications[3].app_guid)).reply(200);

const initialQuery = {
  'start-time': moment().subtract(1, 'weeks').add(1, 'days').startOf('day') * 1000000,
  'end-time': moment().add(1, 'days').startOf('day') * 1000000,
  page: 1,
  'results-per-page': 10,
  order: 'desc'
}
const historyFile = '__tests__/assets/history/history.json'
const historyData = JSON.parse(fs.readFileSync(historyFile))
nock(Constants.restUrl_base).get(Constants.restUrl_appHistory.replace('APP_ID', TestConstants.fakeBoundApps.applications[3].app_guid)).query(initialQuery).reply(200, historyData)

const setup = (location) => {
  const props = {
    location: location
  }
  const wrapper = mount(<ContainerPage {...props} store={store} />)
  return wrapper
}

const fillin = (dom, text) => {
  dom.simulate('change', { target: { value: text, type: 'number' } })
}

describe('ContainerPage -- service view', () => {
  const wrapper = setup({
    pathname: '/manage/' + TestConstants.serviceId,
    query: {},
  })

  it('ContainerPage should render with a nav-bar and a table with 4 rows', (done) => {
    setTimeout(() => {
      wrapper.update()
      expect(wrapper.find('.navbar-header').length).toBe(1)
      expect(wrapper.find('.navbar-left').at(0).find('span').text()).toBe(Locale.getLocale()['headerbar_application_connected'])
      expect(wrapper.find('.navbar-left').at(1).find('.bx--list-box').length).toBe(0)
      expect(wrapper.find('.navbar-right').find('button').find('span').text()).toBe(Locale.getLocale()['headerbar_refresh_button'])
      expect(wrapper.find('thead').find('tr').length).toBe(1)
      expect(wrapper.find('tbody').find('tr').length).toBe(TestConstants.fakeBoundApps.applications.length)
      expect(wrapper.find('tbody').find('tr').at(0).find('td').at(0).text()).toBe(TestConstants.fakeBoundApps.applications[0].app_name)
      expect(wrapper.find('tbody').find('tr').at(0).find('td').at(1).text()).toBe(TestConstants.fakeBoundApps.applications[0].state)
      expect(wrapper.find('tbody').find('tr').at(0).find('td').at(2).text()).toBe(TestConstants.fakeBoundApps.applications[0].instances)
      done()
    }, 100)
  })

  describe('Test policy view -- a bound app without policy', () => {
    it('open dashboard', (done) => {
      wrapper.find('tbody').find('tr').at(1).find('svg').simulate('click')
      setTimeout(() => {
        wrapper.update()
        expect(wrapper.find('.navbar-left').at(0).find('span').text()).toBe(Locale.getLocale()['headerbar_selected_application'])
        expect(wrapper.find('.navbar-left').at(1).find('.bx--list-box').length).toBe(1)
        expect(wrapper.find('.navbar-right').find('button').find('span').text()).toBe(Locale.getLocale()['headerbar_back_button'])
        expect(wrapper.find('.bx--list-box__field').length).toBe(1)
        expect(wrapper.find('.bx--list-box__label').text()).toBe(TestConstants.fakeBoundApps.applications[1].app_name)
        expect(wrapper.find('.bx--tabs').length).toBe(1)
        expect(wrapper.find('.bx--tabs__nav-item').length).toBe(2)
        //create policy content
        expect(wrapper.find('.no-policy-des').at(0).text()).toContain(Locale.getLocale()['app_page_no_policy_defined'])
        done()
      }, 100)
    })

    it('create policy', () => {
      wrapper.find('.no-policy-des').find('button').at(0).simulate('click')
      expect(wrapper.find('.policy-form').length).toBe(1)
      expect(wrapper.find('.bx--inline-notification--warning').length).toBe(1)
    })

    it('save policy', (done) => {
      wrapper.find('.asc-title-header').at(1).find('.policy-form-btn').at(2).simulate('click')
      setTimeout(() => {
        wrapper.update()
        expect(wrapper.find('.bx--inline-notification--warning').length).toBe(0)
        expect(wrapper.find('.bx--inline-notification--success').length).toBe(1)
        done()
      }, 100)
    })

    it('back to service view', () => {
      wrapper.find('.navbar-right').find('button').simulate('click')
      expect(wrapper.find('.navbar-left').at(1).find('.bx--list-box').length).toBe(0)
    })
  })

  describe('Test policy view -- a unbound app', () => {
    it('open dashboard', (done) => {
      wrapper.update()
      wrapper.find('tbody').find('tr').at(2).find('svg').simulate('click')
      setTimeout(() => {
        wrapper.update()
        expect(wrapper.find('.navbar-left').at(0).find('span').text()).toBe(Locale.getLocale()['headerbar_selected_application'])
        expect(wrapper.find('.navbar-left').at(1).find('.bx--list-box').length).toBe(1)
        expect(wrapper.find('.navbar-right').find('button').find('span').text()).toBe(Locale.getLocale()['headerbar_back_button'])
        expect(wrapper.find('.bx--list-box__label').length).toBe(1)
        expect(wrapper.find('.bx--list-box__label').text()).toBe(TestConstants.fakeBoundApps.applications[2].app_name)
        expect(wrapper.find('.bx--tabs').length).toBe(1)
        expect(wrapper.find('.bx--tabs__nav-item').length).toBe(2)
        //create policy content
        expect(wrapper.find('.bx--inline-notification--error').length).toBe(1)
        expect(wrapper.find('.bx--inline-notification--error').text()).toContain(TestConstants.responseBody403.error)
        done()
      }, 100)
    })

    it('back to service view', () => {
      wrapper.find('.navbar-right').find('button').simulate('click')
      expect(wrapper.find('.navbar-left').at(1).find('.bx--list-box').length).toBe(0)
    })
  })

  describe('Test policy view -- a bound app with policy', () => {
    it('open app dashboard', (done) => {
      wrapper.find('tbody').find('tr').at(0).find('svg').simulate('click')
      setTimeout(() => {
        wrapper.update()
        expect(wrapper.find('.navbar-left').at(0).find('span').text()).toBe(Locale.getLocale()['headerbar_selected_application'])
        expect(wrapper.find('.navbar-left').at(1).find('.bx--list-box').length).toBe(1)
        expect(wrapper.find('.navbar-right').find('button').find('span').text()).toBe(Locale.getLocale()['headerbar_back_button'])
        expect(wrapper.find('.bx--list-box__label').length).toBe(1)
        expect(wrapper.find('.bx--list-box__label').text()).toBe(TestConstants.fakeBoundApps.applications[0].app_name)
        expect(wrapper.find('.bx--tabs').length).toBe(1)
        expect(wrapper.find('.bx--tabs__nav-item').length).toBe(3)
        //policy content
        expect(wrapper.find('.rule-limit').text()).toContain(Locale.getLocale()['policy_view_default_limits'].replace('{minInstCount}', TestConstants.fullPolicy.instance_min_count).replace('{maxInstCount}', TestConstants.fullPolicy.instance_max_count))
        let policymap = Util.transformArrayToMap(TestConstants.fullPolicy)
        let tupleIndex = 1
        Object.keys(policymap.scaling_rules_map).map((metricName, i) => {
          let trigger = policymap.scaling_rules_map[metricName]
          expect(wrapper.find('.sub-title').at(i).text()).toContain(Locale.getLocale()[MetricTypeUtil.getMetricOptionDescription(metricName)])
          if (trigger.upper) {
            expect(wrapper.find('.rule-des').at(tupleIndex).text().replace('  ', ' ')).toContain(Locale.getLocale()['policy_view_trigger_add']
              .replace('{instStepCount}', parseInt(trigger.upper[0].adjustment))
              .replace('{triggerTypeDes}', Locale.getLocale()[MetricTypeUtil.getMetricOptionDescription(metricName)])
              .replace('{operator}', trigger.upper[0].operator)
              .replace('{threshold}', trigger.upper[0].threshold)
              .replace('{duration}', trigger.upper[0].breach_duration_secs)
              .replace('{unit}', Locale.getLocale()[MetricTypeUtil.getMetricUnit(metricName)])
            )
            tupleIndex++
          }
          if (trigger.lower) {
            expect(wrapper.find('.rule-des').at(tupleIndex).text().replace('  ', ' ')).toContain(Locale.getLocale()['policy_view_trigger_remove']
              .replace('{instStepCount}', -parseInt(trigger.lower[0].adjustment))
              .replace('{triggerTypeDes}', Locale.getLocale()[MetricTypeUtil.getMetricOptionDescription(metricName)])
              .replace('{operator}', trigger.lower[0].operator)
              .replace('{threshold}', trigger.lower[0].threshold)
              .replace('{duration}', trigger.lower[0].breach_duration_secs)
              .replace('{unit}', Locale.getLocale()[MetricTypeUtil.getMetricUnit(metricName)])
            )
            tupleIndex++
          }
        })
        expect(wrapper.find('.title').at(1).text()).toContain(policymap.schedules.timezone)
        if (policymap.schedules.recurring_schedule) {
          policymap.schedules.recurring_schedule.map((schedule) => {
            let initialText = schedule.initial_min_instance_count ? Locale.getLocale()['policy_view_schedule_description_initialized'].replace('{initialMinInstance}', schedule.initial_min_instance_count) : Locale.getLocale()['policy_view_schedule_description_not_initialized']
            let effectiveRange = schedule.start_date ? Locale.getLocale()['policy_view_recurring_schedule_description_effective'].replace('{startDate}', moment(schedule.start_date).format('LL').replace(/,/g, ' ')).replace('{endDate}', moment(schedule.end_date).format('LL').replace(/,/g, ' ')) : ''
            expect(wrapper.find('.rule-des').at(tupleIndex).text()).toContain(Locale.getLocale()['policy_view_recurring_schedule_description']
              .replace('{minInstance}', schedule.instance_min_count)
              .replace('{maxInstance}', schedule.instance_max_count)
              .replace('{descriptionInitial}', initialText)
              .replace('{startTime}', schedule.start_time)
              .replace('{endTime}', schedule.end_time)
              .replace('{repeatCycle}', JSON.stringify(schedule.days_of_month).replace('[', '').replace(']', '').replace(/,/g, 'th, ').replace(/(.*),/, '$1 and') + 'th')
              .replace('{repeatType}', 'day of the month')
              .replace('{effectiveRange}', effectiveRange)
            )
            tupleIndex++
          })
        }
        if (policymap.schedules.specific_date) {
          policymap.schedules.specific_date.map((schedule) => {
            let initialText = schedule.initial_min_instance_count ? Locale.getLocale()['policy_view_schedule_description_initialized'].replace('{initialMinInstance}', schedule.initial_min_instance_count) : Locale.getLocale()['policy_view_schedule_description_not_initialized']
            expect(wrapper.find('.rule-des').at(tupleIndex).text()).toContain(Locale.getLocale()['policy_view_specific_date_description']
              .replace('{minInstance}', schedule.instance_min_count)
              .replace('{maxInstance}', schedule.instance_max_count)
              .replace('{descriptionInitial}', initialText)
              .replace('{startDate}', moment(schedule.start_date_time).format('LLL').replace(',', ' '))
              .replace('{endDate}', moment(schedule.end_date_time).format('LLL').replace(',', ' '))
            )
            tupleIndex++
          })
        }
        done()
      }, 100)
    })


    describe('edit policy', () => {
      it('switch to edit form', () => {
        wrapper.find('.bottom-button').find('button').at(0).simulate('click')
        expect(wrapper.find('.policy-form').length).toBe(1)
      })
      it('add minimum', () => {
        wrapper.find('#input_minimum_instance').at(0).find('.bx--number__controls').find('button').at(0).simulate('click')
      })
      it('change maximum to 100', () => {
        fillin(wrapper.find('#input_maximum_instance').at(0).find('input'), 100)
      })
    })

    describe('swicth to service view then cancel', () => {
      it('swicth to service view with updated policy', () => {
        wrapper.find('.navbar-right').find('button').simulate('click')
      })
      it('swicth failed with a alert', () => {
        expect(wrapper.find('.is-visible').length).toBe(1)
      })
      it('leave the alert with no action', () => {
        wrapper.find('.bx--modal').simulate('focus')
        wrapper.find('.bx--modal').simulate('focus')
        expect(wrapper.find('.is-visible').length).toBe(0)
      })
    })

    describe('swicth to other app then discard the change', () => {
      it('swicth to another app with updated policy', () => {
        expect(wrapper.find('.is-visible').length).toBe(0)
        wrapper.find('.navbar-left').at(1).find('.bx--list-box__menu-icon').simulate('click')
        expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
        expect(wrapper.find('.bx--list-box__menu-item').length).toBe(TestConstants.fakeBoundApps.applications.length)
        wrapper.find('.bx--list-box__menu-item').at(3).simulate('click')
      })
      it('swicth failed with a alert', () => {
        expect(wrapper.find('.is-visible').length).toBe(1)
      })
      it('force to leave and discard the change', (done) => {
        wrapper.find('.bx--modal__buttons-container').find('.bx--btn--secondary').simulate('click')
        setTimeout(() => {
          wrapper.update()
          expect(wrapper.find('.is-visible').length).toBe(0)
          expect(wrapper.find('.navbar-left').at(1).find('.bx--list-box').length).toBe(1)
          expect(wrapper.find('.navbar-left').at(1).find('.bx--list-box__label').text()).toBe(TestConstants.fakeBoundApps.applications[3].app_name)
          done()
        }, 100)
      })
    })
  })

  describe('Test policy view -- another bound app with policy', () => {

    it('view policy as json', () => {
      wrapper.update()
      expect(wrapper.find('.is-visible').length).toBe(0)
      wrapper.find('.bottom-button').find('button').at(1).simulate('click')
      expect(wrapper.find('.is-visible').length).toBe(1)
      expect(Util.isPolicyArrayEqual(JSON.parse(wrapper.find('pre').text()), TestConstants.fullPolicy)).toBe(true)
    })

    it('close json view', () => {
      wrapper.find('.bx--modal').simulate('focus')
      expect(wrapper.find('.is-visible').length).toBe(0)
    })

    it('switch to metrics view', () => {
      wrapper.update()
      expect(wrapper.find('.metrics-view').length).toBe(0)
      wrapper.find('.bx--tabs').find('.bx--tabs__nav-item').at(1).simulate('click')
      wrapper.update()
      expect(wrapper.find('.metrics-view').length).toBe(1)
    })

    it('switch back to policy view', () => {
      wrapper.update()
      expect(wrapper.find('.policy-des').length).toBe(0)
      wrapper.find('.bx--tabs').find('.bx--tabs__nav-item').at(0).simulate('click')
      expect(wrapper.find('.policy-des').length).toBe(1)
    })

    it('delete json', (done) => {
      wrapper.find('.bottom-button').find('button').at(2).simulate('click')
      setTimeout(() => {
        wrapper.update()
        expect(wrapper.find('.no-policy-des').at(0).text()).toContain(Locale.getLocale()['app_page_no_policy_defined'])
        done()
      }, 100)
    })

    it('switch to history view', (done) => {
      wrapper.update()
      expect(wrapper.find('.history-view').length).toBe(0)
      wrapper.find('.bx--tabs').find('.bx--tabs__nav-item').at(1).simulate('click')
      setTimeout(() => {
        wrapper.update()
        expect(wrapper.find('.history-view').length).toBe(1)
        done()
      }, 100)
    })
    it('back to service view', (done) => {
      wrapper.find('.navbar-right').find('button').simulate('click')
      expect(wrapper.find('.navbar-left').at(1).find('.bx--list-box').length).toBe(0)
      done()
    })
  })

  it('ContainerPage should not render with a nav-bar when app view is opened', () => {
    store.dispatch(ContainerActions.setShowHeaderBar(false))
    wrapper.update()
    expect(wrapper.find('nav').length).toBe(0)
  })

  afterAll(() => {
    wrapper.unmount()
  })

})