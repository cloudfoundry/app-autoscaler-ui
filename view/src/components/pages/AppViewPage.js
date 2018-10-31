import React from 'react'
import { connect } from 'react-redux'
import PolicyView from '../view/PolicyView'
import PolicyForm from '../forms/PolicyForm'
import MetricsView from '../view/MetricsView'
import HistoryView from '../view/HistoryView'
import PolicyActions from '../../actions/PolicyActions'
import Util from '../../common/Util'
import AppActions from '../../actions/AppActions'
import { Loading, Tabs, Tab } from 'carbon-components-react'
import { injectIntl, intlShape } from 'react-intl'

let tabs = [
  { name: 'policy', messageId: 'app_page_tab_policy', children: ['view', 'edit'], show: true },
  { name: 'metrics', messageId: 'app_page_tab_metrics', show: false },
  { name: 'history', messageId: 'app_page_tab_history', show: true }
]

class AppViewPage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
    }
    if (this.props.containerViewData.get('app_id')) {
      this.props.dispatch(PolicyActions.getPolicy(this.props.containerViewData.get('app_id')))
    }
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  policyChanged() {
    let remotePolicy = this.props.appViewData.get('app_policy_data').toJS()
    let currntPolicy = this.props.appViewData.get('app_current_policy_data').toJS()
    return Object.keys(currntPolicy).length != 0 && !Util.isPolicyMapEqual(remotePolicy, currntPolicy)
  }

  onChange(key) {
    let currentView = this.props.appViewData.get('current_view')
    let currentChildren = this.props.appViewData.get('current_children')
    if (!key || !key.name || key.name == currentView) {
      return
    } else if (key.name != 'policy' && currentView == 'policy' && currentChildren == 'edit' && this.policyChanged()) {
      this.props.dispatch(AppActions.setAppPageNextView(key.name))
      this.props.dispatch(AppActions.setAppPageSwitchAlert(2))
    } else {
      this.props.dispatch(AppActions.setAppPageCurrentView(key.name))
    }
  }

  onSwitchToEdit() {
    this.props.dispatch(PolicyActions.setCurrentPolicy(this.props.appViewData.get('app_policy_data').toJS()))
    this.props.dispatch(AppActions.setAppPageCurrentChildren('edit'))
  }

  render() {
    let intl = this.props.intl
    let currentView = this.props.appViewData.get('current_view')
    let currentChildren = this.props.appViewData.get('current_children')
    let selectedIndex = -1
    tabs.map((item, i) => {
      if (item.name == currentView) {
        selectedIndex = i
      }
    })
    let policyExist = this.props.appViewData.get('app_policy_exist')
    if (policyExist) {
      tabs[1].show = true
    } else {
      tabs[1].show = false
    }

    let currentContentView = (() => {
      if (currentView == tabs[0].name) {
        if (currentChildren == tabs[0].children[0]) {
          return (
            <PolicyView onClickEdit={this.onSwitchToEdit.bind(this)} />
          )
        } else {
          return (
            <PolicyForm />
          )
        }
      } else if (currentView == tabs[1].name) {
        return (
          <MetricsView />
        )
      } else {
        return (
          <HistoryView />
        )
      }
    })()

    let tabViews = []
    tabs.map((item, i) => {
      if (item.show) {
        tabViews.push(<Tab
          key={i}
          className={selectedIndex == i ? 'as-tab-selected' : 'as-tab-unselected'}
          label={intl.formatMessage({ id: tabs[i].messageId })}
          onClick={() => { this.onChange(tabs[i]) }}
        />)
      }
    })

    return (
      <div>
        <Tabs triggerHref="#anotherAnchor">
          {tabViews}
        </Tabs>
        <div className='app-view-body'>
          {currentContentView}
        </div>
        <Loading active={this.props.appViewData.get('loading')} />
      </div>
    )
  }
}

AppViewPage.propTypes = {
  intl: intlShape.isRequired
}

export default injectIntl(
  connect(
    state => ({
      appViewData: state.appViewData,
      containerViewData: state.containerViewData,
    })
  )(AppViewPage))
