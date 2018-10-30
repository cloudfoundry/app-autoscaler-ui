import PolicyForm from '../../../src/components/forms/PolicyForm'
import renderer from 'react-test-renderer'
import store from '../../../src/store'
import React from 'react'
import Locale from '../../../src/common/Locale'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import Util from '../../../src/common/Util'

describe('PolicyForm', () => {
  it('renders PolicyForm component correctly', () => {
    const wrapper = renderer.create(
      <Provider store={store}>
        <IntlProvider locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
          <PolicyForm store={store} />
        </IntlProvider>
      </Provider>
    )
    const tree = wrapper.toJSON()
    expect(tree).toMatchSnapshot()
    wrapper.unmount()
  })
})
