import React from 'react'
import nock from 'nock'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import ContainerPage from '../../../src/components/pages/ContainerPage'
import TestConstants from '../../TestConstants'
import Constants from '../../../src/constants/Constants'
import store from '../../../src/store'

configure({ adapter: new Adapter() })
nock(Constants.restUrl_base).get(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.appId)).reply(200, TestConstants.fullPolicy);

const setup = (location) => {
  const props = {
    location: location
  }
  const wrapper = mount(<ContainerPage {...props} store={store} />)
  return wrapper
}

describe('ContainerPage -- app view', () => {
  const wrapper = setup({
    pathname: '/apps/' + TestConstants.appId,
    query: {
      app_id: TestConstants.appId
    },
  })

  it('ContainerPage should render with no nav-bar and no table', (done) => {
    setTimeout(() => {
      wrapper.update()
      expect(wrapper.find('.navbar-header').length).toBe(0)
      expect(wrapper.find('table').find('tr').length).toBe(0)
      done()
    }, 100)
  })

  afterAll(() => {
    wrapper.unmount()
  })

})