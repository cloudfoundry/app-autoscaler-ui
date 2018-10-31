import React from 'react'
import { connect } from 'react-redux'
import { Notification } from 'carbon-components-react'
import { Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import BoundAppTable from '../tables/BoundAppTable'
import AppViewPage from './AppViewPage'
import ContainerActions from '../../actions/ContainerActions'
import Locale from '../../common/Locale'
import HeaderBar from '../bars/HeaderBar'
import store from '../../store'
import Util from '../../common/Util'

class ContainerPage extends React.Component {

  constructor(props) {
    super(props)
    if (this.props.location && this.props.location.query && this.props.location.query.app_id) {
      this.props.dispatch(ContainerActions.setShowHeaderBar(false))
      this.props.dispatch(ContainerActions.setAppId(this.props.location.query.app_id))
    }
    if (this.props.location && this.props.location.query && this.props.location.query.service_id) {
      this.props.dispatch(ContainerActions.setServiceId(this.props.location.query.service_id))
    }
    if (this.props.location && this.props.location.pathname && this.props.location.pathname.split('/').length > 2) {
      if (this.props.location.pathname.indexOf('manage') >= 0) {
        this.props.dispatch(ContainerActions.setServiceId(this.props.location.pathname.split('/')[2]))
      } else if (this.props.location.pathname.indexOf('apps') >= 0) {
        this.props.dispatch(ContainerActions.setShowHeaderBar(false))
        this.props.dispatch(ContainerActions.setAppId(this.props.location.pathname.split('/')[2]))
      }
    }
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  render() {

    let serviceId = this.props.containerViewData.get('service_id')
    let appId = this.props.containerViewData.get('app_id')
    let showHeaderBar = this.props.containerViewData.get('show_header_bar')
    console.log('app=' + appId + ' service=' + serviceId)

    let headerBar = (() => {
      if (showHeaderBar) {
        return <HeaderBar />
      } else {
        return null
      }
    })()

    let mainView = (() => {
      if (appId) {
        return <AppViewPage />
      } else {
        let loadError = this.props.serviceViewData.get('bound_apps_error_msg')
        if (loadError != '') {
          return (
            <div className='as-app-table'>
              <Notification
                title={loadError}
                subtitle=''
                kind='error'
              />
            </div>
          )
        } else {
          return (
            <div className='as-app-table'>
              <BoundAppTable />
            </div>
          )
        }
      }
    })()

    return (
      <Provider store={store}>
        <IntlProvider locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
          <div className='index'>
            {headerBar}
            <div className='app-view'>
              {mainView}
            </div>
          </div>
        </IntlProvider>
      </Provider>
    )
  }
}

export default connect(
  state => ({
    containerViewData: state.containerViewData,
    serviceViewData: state.serviceViewData,
  })
)(ContainerPage)