import React, { Component } from 'react'
import { IntlProvider, FormattedMessage } from 'react-intl'
import { Button, Loading } from 'carbon-components-react'
import { connect } from 'react-redux'
import Locale from '../../common/Locale'
import LocalDropdownV2 from '../local/LocalDropdownV2'
import ServiceBoundAppsActions from '../../actions/ServiceBoundAppsActions'
import ContainerActions from '../../actions/ContainerActions'
import AppActions from '../../actions/AppActions'
import HistoryActions from '../../actions/HistoryActions'
import MetricsActions from '../../actions/MetricsActions'
import PolicyActions from '../../actions/PolicyActions'
import Util from '../../common/Util'

const appView = {
  barTitle: 'headerbar_selected_application',
  barBtnText: 'headerbar_back_button',
  barIconName: 'icon--arrow--left',
}

const serviceView = {
  barTitle: 'headerbar_application_connected',
  barBtnText: 'headerbar_refresh_button',
  barIconName: 'icon--restart',
}

class HeaderBar extends Component {
  constructor(props) {
    super(props)
    let serviceId = this.props.containerViewData.get('service_id')
    if (serviceId && serviceId != '') {
      this.props.dispatch(ServiceBoundAppsActions.getServiceBoundApps(this.props.containerViewData.get('service_id')))
    }
  }

  policyChanged() {
    let remotePolicy = this.props.appViewData.get('app_policy_data').toJS()
    let currntPolicy = this.props.appViewData.get('app_current_policy_data').toJS()
    return Object.keys(currntPolicy).length != 0 && !Util.isPolicyMapEqual(remotePolicy, currntPolicy)
  }

  render() {
    let appId = this.props.containerViewData.get('app_id')
    let barData = serviceView
    let selectApp = null
    if (appId && appId != '') {
      barData = appView
      selectApp = (() => {
        let boundApps = this.props.serviceViewData.get('bound_apps_data').toJS()
        let selectedIndex = 0
        let items = boundApps.map((appData, i) => {
          if (appId == appData.app_guid) {
            selectedIndex = i
          }
          return {
            id: appData.app_guid,
            text: appData.app_name
          }
        })
        return (
          <LocalDropdownV2
            className='form-input-18'
            items={items}
            selectedItem={items[selectedIndex]}
            onChange={(key) => {
              if (this.policyChanged()) {
                this.props.dispatch(AppActions.setAppPageNextView(key.selectedItem.id))
                this.props.dispatch(AppActions.setAppPageSwitchAlert(2))
              } else {
                this.props.dispatch(ContainerActions.setAppId(key.selectedItem.id))
                this.props.dispatch(AppActions.resetAppPage())
                this.props.dispatch(HistoryActions.resetHistoryView())
                this.props.dispatch(MetricsActions.resetMetricsView())
                this.props.dispatch(PolicyActions.getPolicy(key.selectedItem.id))
              }
            }}
          />
        )
      })()
    }

    return (
      <IntlProvider className='index' locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
        <div>
          <nav className='navbar navbar-inverse navbar-fixed-top' role='navigation'>
            <div className='navbar-header'>
              <div className='navbar-brand'>
                <div className='navbar-left as-title'>
                  <FormattedMessage id={barData.barTitle} />
                </div>
                <div className='navbar-left'>
                  {selectApp}
                </div>
                <div className='navbar-right'>
                  <Button
                    kind="ghost"
                    className="navbar-button"
                    icon={barData.barIconName}
                    onClick={() => {
                      if (appId) {
                        if (this.policyChanged()) {
                          this.props.dispatch(AppActions.setAppPageNextView('service'))
                          this.props.dispatch(AppActions.setAppPageSwitchAlert(2))
                        } else {
                          this.props.dispatch(ContainerActions.setAppId(''))
                          this.props.dispatch(AppActions.resetAppPage())
                          this.props.dispatch(HistoryActions.resetHistoryView())
                          this.props.dispatch(MetricsActions.resetMetricsView())
                        }
                      } else {
                        this.props.dispatch(ServiceBoundAppsActions.getServiceBoundApps(this.props.containerViewData.get('service_id')))
                      }
                    }}>
                    <FormattedMessage id={barData.barBtnText} />
                  </Button>
                </div>
              </div>
            </div>
          </nav>
          <Loading active={this.props.serviceViewData.get('loading')} />
        </div>
      </IntlProvider>
    )
  }
}

export default connect(
  state => ({
    serviceViewData: state.serviceViewData,
    containerViewData: state.containerViewData,
    appViewData: state.appViewData
  })
)(HeaderBar)