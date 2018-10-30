import React from 'react'
import Immutable from 'immutable'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
configure({ adapter: new Adapter() })

import SpecificDateTable from '../../../src/components/tables/SpecificDateTable'
import store from '../../../src/store'
import Constants from '../../../src/constants/Constants'

let policy_data = Immutable.fromJS(Constants.templatePolicy)

const setup = () => {
  const props = {
    schedules: policy_data.get('schedules').get('specific_date').toJS(),
    onChangeSpecificDate: (specific_date) => {
      policy_data.get('schedules').set('specific_date', Immutable.fromJS(specific_date))
    },
    timezone: 'UTC'
  }
  const wrapper = mount(
    <SpecificDateTable store={store} {...props} />)
  return {
    props,
    wrapper
  }
}

describe('SpecificDateTable', () => {
  const { props, wrapper } = setup()

  it('SpecificDateTable item should render with a button', () => {
    expect(wrapper.find('Button').length).toBe(1)
  })

  it('SpecificDateTable item should render with a row in theader and a rows in tbody', () => {
    expect(wrapper.find('thead').find('tr').length).toBe(1)
    expect(wrapper.find('tbody').find('tr').length).toBe(1)
  })

  it('click add button, a new row should be added to table form', () => {
    const mockEvent = {
      key: 'Click',
    }
    expect(wrapper.find('Button').length).toBe(1)
    wrapper.find('Button').simulate('click', mockEvent)
    wrapper.find('Button').simulate('click', mockEvent)
    expect(wrapper.find('tbody').find('tr').length).toBe(1)
  })

  it('click remove button, the row should be removed from table form', () => {
    const mockEvent = {
      key: 'Click',
    }
    expect(wrapper.find('tbody').find('tr').length).toBe(1)
    wrapper.find('#removeIcon0').at(0).simulate('click', mockEvent)
    wrapper.find('Icon').at(0).simulate('click', mockEvent)
    expect(wrapper.find('tbody').find('tr').length).toBe(1)
  })
  
})

