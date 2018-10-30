import React from 'react'
import nock from 'nock'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import HeaderBar from '../../../src/components/bars/HeaderBar'
import store from '../../../src/store'
import ContainerActions from '../../../src/actions/ContainerActions'
import Locale from '../../../src/common/Locale'
import Constants from '../../../src/constants/Constants'
import TestConstants from '../../TestConstants'

configure({ adapter: new Adapter() })

describe('HeaderBar', () => {

  it('Test HeaderBar in service view page', () => {
    nock(Constants.restUrl_base).get(Constants.restUrl_serviceBoundApps.replace('SERVICE_ID', TestConstants.serviceId)).reply(200, TestConstants.fakeBoundApps);
    const props = {}
    store.dispatch(ContainerActions.setServiceId(TestConstants.serviceId))
    const wrapper = mount(<HeaderBar store={store} {...props} />)
    expect(wrapper.find('.navbar-left').at(0).find('span').text()).toBe(Locale.getLocale()['headerbar_application_connected'])
    expect(wrapper.find('.navbar-left').at(1).find('.bx--list-box').length).toBe(0)
    expect(wrapper.find('.navbar-right').find('button').find('span').text()).toBe(Locale.getLocale()['headerbar_refresh_button'])
    wrapper.unmount()
  })

  it('Test HeaderBar in service-app view page', (done) => {
    nock(Constants.restUrl_base).get(Constants.restUrl_serviceBoundApps.replace('SERVICE_ID', TestConstants.serviceId)).reply(200, TestConstants.fakeBoundApps);
    const props = {}
    store.dispatch(ContainerActions.setServiceId(TestConstants.serviceId))
    store.dispatch(ContainerActions.setAppId(TestConstants.fakeBoundApps.applications[0].app_guid))
    const wrapper = mount(<HeaderBar store={store} {...props} />)
    setTimeout(() => {
      expect(wrapper.find('.navbar-left').at(0).find('span').text()).toBe(Locale.getLocale()['headerbar_selected_application'])
      expect(wrapper.find('.navbar-left').at(1).find('.bx--list-box').length).toBe(1)
      expect(wrapper.find('.navbar-right').find('button').find('span').text()).toBe(Locale.getLocale()['headerbar_back_button'])
      expect(wrapper.find('.bx--list-box__label').length).toBe(1)

      //expand app selection list
      expect(wrapper.find('.bx--list-box__menu').length).toBe(0)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(0)
      wrapper.find('.bx--list-box__menu-icon').simulate('click')
      expect(wrapper.find('.bx--list-box__menu').length).toBe(1)
      expect(wrapper.find('.bx--list-box__menu-item').length).toBe(TestConstants.fakeBoundApps.applications.length)
      done()
      wrapper.unmount()
    }, 100)
  })

})



