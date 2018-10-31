import React from 'react'
import nock from 'nock'
import { configure, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import BoundAppTable from '../../../src/components/tables/BoundAppTable'
import store from '../../../src/store'
import ServiceBoundAppsActions from '../../../src/actions/ServiceBoundAppsActions'
import Constants from '../../../src/constants/Constants'
import TestConstants from '../../TestConstants'

configure({ adapter: new Adapter() })
nock(Constants.restUrl_base).get(Constants.restUrl_serviceBoundApps.replace('SERVICE_ID', TestConstants.serviceId)).reply(200, TestConstants.fakeBoundApps);
store.dispatch(ServiceBoundAppsActions.getServiceBoundApps(TestConstants.serviceId))

const setup = () => {
  const wrapper = mount(<BoundAppTable store={store} />)
  return {
    wrapper
  }
}

describe('BoundAppTable', () => {

  const { wrapper } = setup()

  it('Test BoundAppTable in service view page -- static', (done) => {
    setTimeout(() => {
      wrapper.update()
      expect(wrapper.find('thead').find('tr').length).toBe(1)
      expect(wrapper.find('tbody').find('tr').length).toBe(TestConstants.fakeBoundApps.applications.length)
      done()
    }, 100)
  })

  afterAll(() => {
    wrapper.unmount()
  })

})