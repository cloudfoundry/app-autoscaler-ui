import PolicyView from '../../../src/components/view/PolicyView'
import renderer from 'react-test-renderer'
import PolicyActions from '../../../src/actions/PolicyActions'
import store from '../../../src/store'
import React from 'react'
import TestConstants from '../../TestConstants'
import Locale from '../../../src/common/Locale'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import Util from '../../../src/common/Util'
import Immutable from 'immutable'

describe('PolicyView', () => {
  const wrapper = renderer.create(
    <Provider store={store}>
      <IntlProvider locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
        <PolicyView store={store} />
      </IntlProvider>
    </Provider>
  )

  it('renders full policy correctly', () => {
    let policyFull = Immutable.fromJS(TestConstants.fullPolicy).toJS()
    delete policyFull.schedules.recurring_schedule[0]['initial_min_instance_count']
    delete policyFull.schedules.specific_date[0]['initial_min_instance_count']
    policyFull.schedules.recurring_schedule.push({
      'start_time': '00:00',
      'end_time': '10:00',
      'days_of_week': [
        1,
        2,
        3
      ],
      'instance_min_count': 1,
      'instance_max_count': 10,
      'initial_min_instance_count': 5
    })
    store.dispatch(PolicyActions.getPolicySuccess(Util.transformArrayToMap(policyFull)))
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders policy without recurring schedules correctly', () => {
    let policyWithoutSchedules = Immutable.fromJS(TestConstants.fullPolicy).toJS()
    delete policyWithoutSchedules['schedules']['recurring_schedule']
    store.dispatch(PolicyActions.getPolicySuccess(Util.transformArrayToMap(policyWithoutSchedules)))
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders policy without specific date schedules correctly', () => {
    let policyWithoutSchedules = Immutable.fromJS(TestConstants.fullPolicy).toJS()
    delete policyWithoutSchedules['schedules']['specific_date']
    store.dispatch(PolicyActions.getPolicySuccess(Util.transformArrayToMap(policyWithoutSchedules)))
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders policy without schedules correctly', () => {
    let policyWithoutSchedules = Immutable.fromJS(TestConstants.fullPolicy).toJS()
    delete policyWithoutSchedules['schedules']
    store.dispatch(PolicyActions.getPolicySuccess(Util.transformArrayToMap(policyWithoutSchedules)))
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders policy without triggers correctly', () => {
    let policyWithoutTriggers = Immutable.fromJS(TestConstants.fullPolicy).toJS()
    delete policyWithoutTriggers['scaling_rules']
    store.dispatch(PolicyActions.getPolicySuccess(Util.transformArrayToMap(policyWithoutTriggers)))
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
  })

  afterAll(() => {
    wrapper.unmount()
  })
})
