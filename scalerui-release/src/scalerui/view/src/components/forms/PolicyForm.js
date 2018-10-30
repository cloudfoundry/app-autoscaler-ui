import React from 'react'
import { connect } from 'react-redux'
import { Button, Notification, Accordion, AccordionItem } from 'carbon-components-react'
import { FormattedMessage } from 'react-intl'
import LocalDropdownV2 from '../local/LocalDropdownV2'
import moment from 'moment-timezone'
import RecurringScheduleView from '../view/RecurringScheduleView'
import SpecificDateTable from '../tables/SpecificDateTable'
import RuleDefineView from '../view/RuleDefineView'
import Constants from '../../constants/Constants'
import LocalNotification from '../local/LocalNotification'
import StateNumberInput from '../inputs/StateNumberInput'
import Util from '../../common/Util'
import MetricsActions from '../../actions/MetricsActions'
import HistoryActions from '../../actions/HistoryActions'
import PolicyActions from '../../actions/PolicyActions'
import LocalModal from '../local/LocalModal'
import AppActions from '../../actions/AppActions'
import ContainerActions from '../../actions/ContainerActions'
import LocalTooltip from '../local/LocalTooltip'

const timezoneItems = moment.tz.names().map((item) => {
  return {
    id: item
  }
})

class PolicyForm extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      show_save_status: false,
      forceClear: false
    }
    let policyData = this.props.appViewData.get('app_current_policy_data').toJS()
    let policyExist = this.props.appViewData.get('app_policy_exist')
    if (Object.keys(policyData).length == 0) {
      if (policyExist) {
        this.props.dispatch(PolicyActions.setCurrentPolicy(this.props.appViewData.get('app_policy_data').toJS()))
      } else {
        this.props.dispatch(PolicyActions.setCurrentPolicy(Util.transformArrayToMap(Constants.defaultPolicy)))
      }
    }
  }

  componentDidMount() {
  }

  componentDidUpdate() {
    let remotePolicy = this.props.appViewData.get('app_policy_data').toJS()
    let currntPolicy = this.props.appViewData.get('app_current_policy_data').toJS()
    if (Util.isPolicyMapEqual(remotePolicy, currntPolicy)) {
      window.removeEventListener('beforeunload', this.alertMessage)
    } else {
      window.addEventListener('beforeunload', this.alertMessage);
    }
  }

  componentWillUnmount() {
    this.props.dispatch(PolicyActions.setCurrentPolicy({}))
  }

  alertMessage(e) {
    e.returnValue = true;
  }


  componentWillMount() {
  }

  onChangeTimezone(key, policyData) {
    policyData.schedules.timezone = key.selectedItem.id
    this.props.dispatch(PolicyActions.setCurrentPolicy(policyData))
    this.setState({
      show_save_status: false
    })
  }

  onNumberInputChange(e, policy, fieldName) {
    if (e.target.type == 'number') {
      Util.numberInputUpdate(e.target.value, policy, fieldName)
      this.props.dispatch(PolicyActions.setCurrentPolicy(policy))
      this.setState({
        show_save_status: false
      })
    }
  }

  onNumberInputClick(e, type, policy, fieldName) {
    if (type != undefined) {
      let value = Util.numberInputOnclickValue(policy[fieldName], type)
      Util.numberInputUpdate(value, policy, fieldName)
      this.props.dispatch(PolicyActions.setCurrentPolicy(policy))
      this.setState({
        show_save_status: false
      })
    }
  }

  onSubmitPolicy(policyData) {
    this.props.dispatch(PolicyActions.setPolicy(this.props.containerViewData.get('app_id'), policyData))
    this.state.show_save_status = true
    this.setState(this.state)
  }

  onResetPolicy() {
    let policyData = this.props.appViewData.get('app_policy_data').toJS()
    if (Object.keys(policyData).length == 0) {
      policyData = Util.transformArrayToMap(Constants.defaultPolicy)
    }
    this.props.dispatch(PolicyActions.setCurrentPolicy(policyData))
    this.setState({
      show_save_status: false,
      forceClear: true
    })
  }

  render() {
    if (this.state.forceClear) {
      this.setState({ forceClear: false })
      return null
    }

    let policyData = this.props.appViewData.get('app_current_policy_data').toJS()

    if (Object.keys(policyData).length == 0) {
      return null
    }

    let selectedTimezone = {
      id: policyData.schedules.timezone
    }

    let alertMessages = Util.checkPolicy(policyData)

    let alertNotifications = alertMessages.map((msg, i) => {
      return (
        <LocalNotification
          key={i}
          titleId={msg}
          kind='error'
        />
      )
    })

    let submitError = (() => {
      if (this.state.show_save_status && this.props.appViewData.get('app_policy_set_error_msg') != '') {
        return (
          <LocalNotification
            titleId={[{ id: 'policy_form_submit_save_failed' }, {}]}
            subtitle={this.props.appViewData.get('app_policy_set_error_msg')}
            kind='error'
          />
        )
      } else {
        return null
      }
    })()

    let submitValidationErrors = this.props.appViewData.get('app_policy_set_error_body').toJS().map((item, i) => {
      return (
        <Notification
          key={i}
          title={item.stack}
          subtitle=''
          kind='error'
        />
      )
    })

    let policyNotChanged = Util.isPolicyMapEqual(policyData, this.props.appViewData.get('app_policy_data').toJS())
    let submitSuccess = (() => {
      if (this.state.show_save_status && policyNotChanged && this.props.appViewData.get('app_policy_save_success')) {
        return (
          <LocalNotification
            titleId={[
              { id: 'policy_form_submit_saved' },
              {}
            ]}
            kind='success'
          />
        )
      } else {
        return null
      }
    })()

    let submitWarning = (() => {
      if (!policyNotChanged) {
        return (
          <LocalNotification
            titleId={[
              { id: 'policy_form_submit_unsaved' },
              {}
            ]}
            kind='warning'
          />
        )
      } else {
        return null
      }
    })()

    let submitBtn = (() => {
      return (
        <Button
          className='policy-form-btn'
          disabled={policyNotChanged || alertMessages.length > 0}
          icon='icon--save'
          onClick={() => { this.onSubmitPolicy(policyData) }}>
          <FormattedMessage id='policy_form_save_button' />
        </Button>
      )
    })()

    let resetBtn = (() => {
      return (
        <Button
          className='policy-form-btn'
          disabled={policyNotChanged}
          icon='icon--restart'
          onClick={() => { this.onResetPolicy() }}>
          <FormattedMessage id='policy_form_reset_button' />
        </Button>
      )
    })()

    return (
      <div className='policy-form policy-des'>
        <div className='asc-title-header'>
          <FormattedMessage id='policy_form_title' />
        </div>
        <div className='asc-title-header'>
          <Button
            className='policy-form-btn'
            icon='icon--arrow--left'
            onClick={() => {
              if (policyNotChanged) {
                this.props.dispatch(AppActions.setAppPageCurrentChildren('view'))
              } else {
                this.props.dispatch(AppActions.setAppPageNextView('view'))
                this.props.dispatch(AppActions.setAppPageSwitchAlert(2))
              }
            }}>
            <FormattedMessage id='policy_form_back_button' />
          </Button>
          {submitBtn}
          {resetBtn}
        </div>
        {alertNotifications}
        {submitError}
        {submitValidationErrors}
        {submitSuccess}
        {submitWarning}
        <Accordion>
          <AccordionItem title={<div className='title'>
            <FormattedMessage id='policy_form_default_limits'/>
          </div>} open>
            <div className='instance-limit-form'>
              <div className='bx--grid'>
                <div className='bx--row'>
                  <div className='bx--col-xs-12 bx--col-md-3 sub-title'>
                    <LocalTooltip
                      id='input_minimum_instance_tooltip'
                      labelId='policy_form_default_minimum_instance'
                      messageId='policy_form_default_minimum_instance_desc'/>
                  </div>
                  <div className='bx--col-xs-12 bx--col-md-3 sub-title'>
                    <StateNumberInput
                      id='input_minimum_instance'
                      className='form-input-6'
                      onChange={(e) => {
                        this.onNumberInputChange(e, policyData, 'instance_min_count')
                      }}
                      onClick={(e, type) => {
                        this.onNumberInputClick(e, type, policyData, 'instance_min_count')
                      }}
                      min={1}
                      max={policyData.instance_max_count - 1}
                      value={policyData.instance_min_count}
                      step={1}
                    />
                  </div>
                </div>
                <div className='bx--row'>
                  <div className='bx--col-xs-12 bx--col-md-3 sub-title'>
                    <LocalTooltip
                      id='input_maximum_instance_tooltip'
                      labelId='policy_form_default_maximum_instance'
                      messageId='policy_form_default_maximum_instance_desc'/>
                  </div>
                  <div className='bx--col-xs-12 bx--col-md-3 sub-title'>
                    <StateNumberInput
                      id='input_maximum_instance'
                      className='form-input-6'
                      onChange={(e) => {
                        this.onNumberInputChange(e, policyData, 'instance_max_count')
                      }}
                      onClick={(e, type) => {
                        this.onNumberInputClick(e, type, policyData, 'instance_max_count')
                      }}
                      min={policyData.instance_min_count + 1}
                      max={Number.MAX_VALUE}
                      value={policyData.instance_max_count}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            </div>

          </AccordionItem>
          <AccordionItem title={<div className='title'>
            <FormattedMessage id='policy_view_scaling_rules'/>
          </div>} open>
            <RuleDefineView
              policyTriggers={policyData.scaling_rules_form}
              maxInstance={policyData.instance_max_count}
              onChangePolicyTriggers={() => {
                this.props.dispatch(PolicyActions.setCurrentPolicy(policyData))
                this.setState({
                  show_save_status: false
                })
              }
              } />
          </AccordionItem>
          <AccordionItem title={<div className='title'>
            <FormattedMessage id='policy_view_schedules' />
          </div>} >
            <div className='formTriggersDescription'>
              <div className='sub-title inline'>
                <FormattedMessage id='history_page_time_zone' />
              </div>
              <div className='inline'>
                <LocalDropdownV2
                  className='as-timezone form-input-12'
                  items={timezoneItems}
                  selectedItem={selectedTimezone}
                  onChange={(key) => { this.onChangeTimezone(key, policyData) }}
                />
              </div>
            </div>
            <RecurringScheduleView
              schedules={policyData.schedules.recurring_schedule}
              onChangeRecurringSchedule={(recurring_schedule) => {
                policyData.schedules.recurring_schedule = recurring_schedule
                this.props.dispatch(PolicyActions.setCurrentPolicy(policyData))
                this.setState({
                  show_save_status: false
                })
              }}
            />
            <SpecificDateTable
              schedules={policyData.schedules.specific_date}
              timezone={policyData.schedules.timezone}
              onChangeSpecificDate={(specific_date) => {
                policyData.schedules.specific_date = specific_date
                this.props.dispatch(PolicyActions.setCurrentPolicy(policyData))
                this.setState({
                  show_save_status: false
                })
              }}
            />
          </AccordionItem>
        </Accordion>

        <div className='bottom-button'>
          {submitBtn}
          {resetBtn}
        </div>
        <LocalModal
          onFocus={() => {
            this.props.dispatch(AppActions.setAppPageSwitchAlert(this.props.appViewData.get('show_switch_alert') - 1))
          }}
          open={this.props.appViewData.get('show_switch_alert') > 0}
          passiveModal={false}
          modalHeadingId='policy_form_submit_leave_alert'
          primaryButtonTextId='policy_form_submit_leave_alert_save'
          secondaryButtonTextId='policy_form_submit_leave_alert_ignore'
          onSecondarySubmit={() => {
            let next = this.props.appViewData.get('next_view')
            if (next == 'view') {
              this.props.dispatch(AppActions.setAppPageCurrentChildren('view'))
            } else if (next == 'metrics' || next == 'history') {
              this.props.dispatch(AppActions.setAppPageCurrentChildren('view'))
              this.props.dispatch(AppActions.setAppPageCurrentView(next))
            } else if (next == 'service') {
              this.props.dispatch(ContainerActions.setAppId(''))
              this.props.dispatch(AppActions.resetAppPage())
              this.props.dispatch(HistoryActions.resetHistoryView())
              this.props.dispatch(MetricsActions.resetMetricsView())
            } else {
              this.props.dispatch(ContainerActions.setAppId(next))
              this.props.dispatch(AppActions.resetAppPage())
              this.props.dispatch(HistoryActions.resetHistoryView())
              this.props.dispatch(MetricsActions.resetMetricsView())
              this.props.dispatch(PolicyActions.getPolicy(next))
            }
          }}
          onRequestSubmit={() => {
            this.props.dispatch(AppActions.setAppPageSwitchAlert(0))
            if (alertMessages.length == 0) {
              this.onSubmitPolicy(policyData)
            }
          }}
        />
      </div >
    )
  }
}

export default connect(
  state => ({
    appViewData: state.appViewData,
    containerViewData: state.containerViewData
  })
)(PolicyForm)
