import nock from 'nock'
import PolicyForm from '../../../src/components/forms/PolicyForm'
import ContainerActions from '../../../src/actions/ContainerActions'
import PolicyActions from '../../../src/actions/PolicyActions'
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

const submitPolicyFile = '__tests__/assets/policy/policy.formsubmit.json'
const submitPolicyData = JSON.parse(fs.readFileSync(submitPolicyFile))

configure({ adapter: new Adapter() })

const setup = () => {
  const wrapper = mount(
    <Provider store={store}>
      <IntlProvider locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
        <PolicyForm />
      </IntlProvider>
    </Provider>
  )
  return wrapper
}

store.dispatch(ContainerActions.setAppId(TestConstants.appId))
store.dispatch(PolicyActions.getPolicySuccess(Util.transformArrayToMap(TestConstants.fullPolicy)))

const fillin = (dom, text) => {
  dom.simulate('change', { target: { value: text, type: 'number' } })
}

describe('PolicyForm function test', () => {

  const wrapper = setup()

  describe('Default Instance Limits', () => {
    it('add minimum', () => {
      wrapper.find('#input_minimum_instance').at(0).find('.bx--number__controls').find('button').at(0).simulate('click')
    })
    it('change maximum to 100', () => {
      fillin(wrapper.find('#input_maximum_instance').at(0).find('input'), 100)
      // wrapper.find('#input_maximum_instance').at(0).find('.bx--number__controls').find('button').at(1).simulate('click')
    })
  })

  describe('Scaling Rule(s)', () => {
    it('remove upper and lower trigger of memoryused', () => {
      expect(wrapper.find('.trigger-tile').length).toBe(16)
      wrapper.find('.trigger-tile').at(0).find('.remove-btn').at(0).simulate('click')
      wrapper.find('.trigger-tile').at(1).find('.remove-btn').at(0).simulate('click')
      expect(wrapper.find('.trigger-tile').length).toBe(12)
    })
    it('expand lower trigger of memoryutil', () => {
      expect(wrapper.find('.trigger-tile').at(0).find('.tileBelowTheFoldContent').length).toBe(0)
      wrapper.find('.trigger-tile').at(0).find('.as-expand-icon').at(0).simulate('click')
      expect(wrapper.find('.trigger-tile').at(0).find('.tileBelowTheFoldContent').length).toBe(1)
    })
    it('change lower trigger of memoryutil to memoryused', () => {
      wrapper.find('.trigger-tile').at(0).find('.bx--list-box__menu-icon').at(0).simulate('click')
      expect(wrapper.find('.trigger-tile').at(0).find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.trigger-tile').at(0).find('.bx--list-box__menu-item').length).toBe(4)
      wrapper.find('.trigger-tile').at(0).find('.bx--list-box__menu-item').at(1).simulate('click')
    })
    it('change lower trigger of memoryutil to memoryused', () => {
      wrapper.find('.trigger-tile').at(0).find('.bx--list-box__menu-icon').at(1).simulate('click')
      expect(wrapper.find('.trigger-tile').at(0).find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.trigger-tile').at(0).find('.bx--list-box__menu-item').length).toBe(4)
      wrapper.find('.trigger-tile').at(0).find('.bx--list-box__menu-item').at(2).simulate('click')
    })
    it('change lower trigger of memoryused to upper', () => {
      wrapper.find('.trigger-tile').at(0).find('.bx--list-box__menu-icon').at(1).simulate('click')
      expect(wrapper.find('.trigger-tile').at(0).find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.trigger-tile').at(0).find('.bx--list-box__menu-item').length).toBe(4)
      wrapper.find('.trigger-tile').at(0).find('.bx--list-box__menu-item').at(1).simulate('click')
    })
    it('update setting of memoryused upper trigger', () => {
      wrapper.find('.trigger-tile').at(0).find('.bx--number').at(0).find('.bx--number__controls').find('button').at(0).simulate('click')
      wrapper.find('.trigger-tile').at(0).find('.bx--number').at(1).find('.bx--number__controls').find('button').at(0).simulate('click')
      wrapper.find('.trigger-tile').at(0).find('.bx--number').at(2).find('.bx--number__controls').find('button').at(0).simulate('click')
      wrapper.find('.trigger-tile').at(0).find('.bx--number').at(3).find('.bx--number__controls').find('button').at(1).simulate('click')
    })
    it('update setting of memoryused upper trigger', () => {
      wrapper.find('.trigger-tile').at(0).find('.bx--number').at(0).find('.bx--number__controls').find('button').at(0).simulate('click')
      wrapper.find('.trigger-tile').at(0).find('.bx--number').at(1).find('.bx--number__controls').find('button').at(0).simulate('click')
      wrapper.find('.trigger-tile').at(0).find('.bx--number').at(2).find('.bx--number__controls').find('button').at(0).simulate('click')
      wrapper.find('.trigger-tile').at(0).find('.bx--number').at(3).find('.bx--number__controls').find('button').at(1).simulate('click')
    })
    it('fold upper trigger of memoryused', () => {
      expect(wrapper.find('.trigger-tile').at(0).find('.tileBelowTheFoldContent').length).toBe(1)
      wrapper.find('.trigger-tile').at(0).find('.as-expand-icon').at(0).simulate('click')
      expect(wrapper.find('.trigger-tile').at(0).find('.tileBelowTheFoldContent').length).toBe(0)
    })
    it('add new trigger', () => {
      wrapper.find('.fake-tile').at(0).find('.policy-form-btn').at(0).simulate('click')
      expect(wrapper.find('.trigger-tile').length).toBe(14)
    })
  })

  describe('Time Zone', () => {
    it('change timezone to Africa/Accra', () => {
      wrapper.find('.as-timezone').at(0).find('.bx--list-box__menu-icon').at(0).simulate('click')
      expect(wrapper.find('.as-timezone').at(0).find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.as-timezone').at(0).find('.bx--list-box__menu-item').length).toBe(592)
      wrapper.find('.as-timezone').at(0).find('.bx--list-box__menu-item').at(1).simulate('click')
    })
  })

  describe('Recurring Schedules', () => {
    it('remove first recurring schedule', () => {
      expect(wrapper.find('.recurring-tile').length).toBe(4)
      wrapper.find('.recurring-tile').at(0).find('.remove-btn').at(0).simulate('click')
      expect(wrapper.find('.recurring-tile').length).toBe(2)
    })
    it('change Effective Duration of first recurring schedule to always', () => {
      wrapper.find('.recurring-tile').at(0).find('.form-toggle').find('input').at(0).simulate('change', { target: { checked: false } })
    })
    it('change Repeat On of first recurring schedule', () => {
      wrapper.find('.recurring-tile').at(0).find('.bx--radio-button-group').find('input').at(0).simulate('change', { target: { value: 'week' } })
      wrapper.find('.recurring-tile').at(0).find('.multi-select-repeat').find('svg').at(0).simulate('click')
      expect(wrapper.find('.recurring-tile').at(0).find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.recurring-tile').at(0).find('.bx--list-box__menu-item').length).toBe(7)
      wrapper.find('.recurring-tile').at(0).find('.bx--list-box__menu-item').at(0).simulate('click')
      wrapper.find('.recurring-tile').at(0).find('.bx--list-box__menu-item').at(2).simulate('click')
      wrapper.find('.recurring-tile').at(0).find('.bx--list-box__menu-item').at(4).simulate('click')
      wrapper.find('.recurring-tile').at(0).find('.bx--list-box__menu-item').at(6).simulate('click')
      wrapper.find('.recurring-tile').at(0).find('.bx--list-box__menu-item').at(6).simulate('click')
      expect(wrapper.find('.recurring-tile').at(0).find('.select-tag').length).toBe(3)
      wrapper.find('.recurring-tile').at(0).find('.select-tag').find('.select-tag-remove').first().simulate('click')
      expect(wrapper.find('.recurring-tile').at(0).find('.select-tag').length).toBe(2)
    })
    it('change Start/End time of first recurring schedule', () => {
      wrapper.find('.recurring-tile').at(0).find('.bx--dropdown').at(0).find('.bx--list-box__menu-icon').simulate('click')
      expect(wrapper.find('.recurring-tile').at(0).find('.bx--dropdown').at(0).find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.recurring-tile').at(0).find('.bx--dropdown').at(0).find('.bx--list-box__menu-item').length).toBe(96)
      wrapper.find('.recurring-tile').at(0).find('.bx--dropdown').at(0).find('.bx--list-box__menu-item').at(1).simulate('click')
      wrapper.find('.recurring-tile').at(0).find('.bx--dropdown').at(2).find('.bx--list-box__menu-icon').simulate('click')
      expect(wrapper.find('.recurring-tile').at(0).find('.bx--dropdown').at(2).find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.recurring-tile').at(0).find('.bx--dropdown').at(2).find('.bx--list-box__menu-item').length).toBe(96)
      wrapper.find('.recurring-tile').at(0).find('.bx--dropdown').at(2).find('.bx--list-box__menu-item').at(2).simulate('click')
    })
    it('change Instance Count of first recurring schedule', () => {
      fillin(wrapper.find('.recurring-tile').at(0).find('.bx--number').at(0).find('input'), 5)
      wrapper.find('.recurring-tile').at(0).find('.bx--number').at(0).find('.bx--number__controls').find('button').at(0).simulate('click')
      wrapper.find('.recurring-tile').at(0).find('.bx--number').at(1).find('.bx--number__controls').find('button').at(0).simulate('click')
      fillin(wrapper.find('.recurring-tile').at(0).find('.bx--number').at(1).find('input'), '')
      fillin(wrapper.find('.recurring-tile').at(0).find('.bx--number').at(2).find('input'), 30)
      wrapper.find('.recurring-tile').at(0).find('.bx--number').at(2).find('.bx--number__controls').find('button').at(1).simulate('click')
    })
    it('add new recurring schedule', () => {
      wrapper.find('.fake-tile').at(2).find('.policy-form-btn').at(0).simulate('click')
      expect(wrapper.find('.recurring-tile').length).toBe(4)
    })
    it('change Effective Duration of first recurring schedule to always', () => {
      wrapper.find('.recurring-tile').at(2).find('.form-toggle').find('input').at(0).simulate('change', { target: { checked: true } })
    })
  })

  describe('Specific Date(s)', () => {
    it('remove first specific date', () => {
      expect(wrapper.find('.specific-form').find('tbody').find('tr').length).toBe(2)
      wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('#removeIcon0').at(0).simulate('click')
      expect(wrapper.find('.specific-form').find('tbody').find('tr').length).toBe(1)
    })
    it('change Start time of first specific date', () => {
      // fillin(wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--date-picker').at(0).find('input'), '2020-09-13') bx--date-picker is rendered without input!!!
      wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--dropdown').at(0).find('.bx--list-box__menu-icon').simulate('click')
      expect(wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--dropdown').at(0).find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--dropdown').at(0).find('.bx--list-box__menu-item').length).toBe(96)
      wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--dropdown').at(0).find('.bx--list-box__menu-item').at(1).simulate('click')
    })

    it('change End time of first specific date', () => {
      // fillin(wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--date-picker').at(1).find('input'), '2020-09-14') bx--date-picker is rendered without input!!!
      wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--dropdown').at(2).find('.bx--list-box__menu-icon').simulate('click')
      expect(wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--dropdown').at(2).find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--dropdown').at(2).find('.bx--list-box__menu-item').length).toBe(96)
      wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--dropdown').at(2).find('.bx--list-box__menu-item').at(2).simulate('click')
    })
    it('change Instance Count of first specific date', () => {
      fillin(wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--number').at(0).find('input'), 1)
      wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--number').at(0).find('.bx--number__controls').find('button').at(0).simulate('click')
      wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--number').at(1).find('.bx--number__controls').find('button').at(1).simulate('click')
      fillin(wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--number').at(1).find('input'), '')
      fillin(wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--number').at(2).find('input'), 30)
      wrapper.find('.specific-form').find('tbody').find('tr').at(0).find('.bx--number').at(2).find('.bx--number__controls').find('button').at(1).simulate('click')
    })
    it('add new specific date', () => {
      wrapper.find('.fake-tile').at(4).find('.policy-form-btn').at(0).simulate('click')
      expect(wrapper.find('.specific-form').find('tbody').find('tr').length).toBe(2)
    })
  })

  describe('try to leave the form', () => {
    it('try back to service view then cancel', () => {
      expect(wrapper.find('.is-visible').length).toBe(0)
      wrapper.find('.asc-title-header').at(1).find('.policy-form-btn').at(0).simulate('click')
      expect(wrapper.find('.is-visible').length).toBe(1)
      wrapper.find('.bx--modal').simulate('focus')
      wrapper.find('.bx--modal').simulate('focus')
      expect(wrapper.find('.is-visible').length).toBe(0)
    })
  })

  describe('save the policy before leave', () => {
    it('submit policy', (done) => {
      wrapper.find('.asc-title-header').at(1).find('.policy-form-btn').at(0).simulate('click')
      expect(wrapper.find('.is-visible').length).toBe(1)
      let currentPolicy = store.getState().appViewData.get('app_current_policy_data').toJS()
      nock(Constants.restUrl_base).put(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.appId)).reply(200, Util.transformMapToArray(currentPolicy))
      wrapper.find('.bx--modal__buttons-container').find('.bx--btn--primary').simulate('click')
      setTimeout(()=>{
        expect(Util.isEqual(store.getState().appViewData.get('app_policy_data').toJS(), submitPolicyData))
        done()
      }, 100)
    })
  })

  afterAll(() => {
    wrapper.unmount()
  })

})