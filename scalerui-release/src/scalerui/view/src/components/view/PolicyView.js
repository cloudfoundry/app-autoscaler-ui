import React from 'react'
import { connect } from 'react-redux'
import { Button, Tile, Icon, Modal } from 'carbon-components-react'
import Immutable from 'immutable'
import { FormattedMessage } from 'react-intl'
import MetricTypeUtil from '../../common/MetricTypeUtil'
import Util from '../../common/Util'
import Clipboard from 'clipboard'
import PolicyActions from '../../actions/PolicyActions'
import LocalNotification from '../local/LocalNotification'
import Constants from '../../constants/Constants';
import moment from 'moment'
import LocalCodeSnippet from '../local/LocalCodeSnippet'

class PolicyView extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      data: Immutable.fromJS({
        showJson: false
      })
    }
  }

  componentWillMount() {
  }

  componentWillUnmount() {
    this.props.dispatch(PolicyActions.resetDeletePolicyError())
  }

  render() {

    if (this.props.appViewData.get('loading')) {
      return null
    }

    let loadError = this.props.appViewData.get('app_policy_error_msg')
    if (loadError != '') {
      return (
        <LocalNotification
          titleId={[{ id: 'policy_view_load_failed' }, {}]}
          subtitle={loadError}
          kind='error'
        />
      )
    }

    let deleteError = (() => {
      if (this.props.appViewData.get('app_policy_delete_error_msg') != '') {
        return (
          <LocalNotification
            titleId={[{ id: 'policy_view_delete_failed' }, {}]}
            subtitle={this.props.appViewData.get('app_policy_delete_error_msg')}
            kind='error'
          />
        )
      } else {
        return null
      }
    })()

    let policyExist = this.props.appViewData.get('app_policy_exist')
    if (!policyExist) {
      return (
        < Tile className='no-policy-des'>
          <Icon name='icon--warning' className='extra-class' fill='#3d70b2' style={{ marginBottom: '0.5em' }} />
          {/* <div className='i-alert-grey-large' style={{ display: 'inline-block' }}></div> */}
          <FormattedMessage id='app_page_no_policy_defined' tagName='p' />
          <Button kind='primary' onClick={this.props.onClickEdit} style={{ marginTop: '0.5em' }}>
            <FormattedMessage id='app_page_create_policy_button' />
          </Button>
        </Tile>
      )
    }

    let no_service_warning = (() => {
      return (
        <div style={{ background: '#FFF', color: '#000' }}>
          <FormattedMessage id='service_enablement_disabled' />
        </div>
      )
    })()

    let app_policy_data = this.props.appViewData.get('app_policy_data').toJS()

    let policyJson = JSON.stringify(Util.transformMapToArray(app_policy_data), null, '\t')
    new Clipboard('.bx--snippet-button', {
      text: function () {
        return policyJson
      }
    })

    let triggerView = (() => {
      if (app_policy_data.scaling_rules_map == null || app_policy_data.scaling_rules_map == undefined || Object.keys(app_policy_data.scaling_rules_map).length == 0) {
        return null
      } else {
        let metricTypes = Object.keys(app_policy_data.scaling_rules_map)
        let triggerDivs = metricTypes.map((metricType, i) => {
          let triggerTypeDesMessageId = MetricTypeUtil.getMetricOptionDescription(metricType);
          let policyAddMessageId = 'policy_view_trigger_add'
          let policyRemoveMessageId = 'policy_view_trigger_remove'
          let trigger = app_policy_data.scaling_rules_map[metricType]
          let upperDiv = (() => {
            if (trigger.upper && trigger.upper.length > 0) {
              return trigger.upper.map((upper, upperIndex) => {
                return (
                  <div className='rule-des' key={upperIndex}>
                    ●&nbsp;&nbsp;&nbsp;
                    {/* <img src={scaleOutImage}></img> */}
                    <nobr className='scale-out-arrow'>➚ </nobr>
                    <FormattedMessage
                      id={policyAddMessageId}
                      values={
                        {
                          instStepCount: <span className='bold-num bold-num-up'>{upper.adjustment.replace('+', '')}</span>,
                          triggerTypeDes: <FormattedMessage id={triggerTypeDesMessageId} />,
                          operator: upper.operator,
                          threshold: <span className='bold-num'>{upper.threshold} </span>,
                          unit: <span className='bold-num'><FormattedMessage id={MetricTypeUtil.getMetricUnit(metricType)} tagName='nobr' /></span>,
                          duration: upper.breach_duration_secs ? upper.breach_duration_secs : Constants.policyDefaultSetting.scaling_rules.breach_duration_secs_default
                        }
                      }
                    />
                  </div>
                )
              })
            } else {
              return null
            }

          })()
          let lowerDiv = (() => {
            if (trigger.lower) {
              return trigger.lower.map((lower, lowerIndex) => {
                return (
                  <div className='rule-des' key={lowerIndex}>
                    {/* <img src={scaleInImage}></img> */}
                    ●&nbsp;&nbsp;&nbsp;
                    <nobr className='scale-in-arrow'>➘ </nobr>
                    <FormattedMessage
                      id={policyRemoveMessageId}
                      values={
                        {
                          instStepCount: <span className='bold-num bold-num-down'>{lower.adjustment.replace('-', '')}</span>,
                          triggerTypeDes: <FormattedMessage id={triggerTypeDesMessageId} />,
                          operator: lower.operator,
                          threshold: <span className='bold-num'>{lower.threshold}</span>,
                          unit: <span className='bold-num'><FormattedMessage id={MetricTypeUtil.getMetricUnit(metricType)} tagName='nobr' /></span>,
                          duration: lower.breach_duration_secs ? lower.breach_duration_secs : Constants.policyDefaultSetting.scaling_rules.breach_duration_secs_default
                        }
                      }
                    />
                  </div>
                )
              })
            } else {
              return null
            }
          })()

          return (
            <div className='' key={i}>
              <div className='sub-title'>
                <FormattedMessage
                  id='policy_view_scaling_rule_with_index'
                  values={{ index: i + 1 }} />
                <FormattedMessage
                  id='policy_view_trigger_type_des'
                  values={{
                    triggerTypeDes: <FormattedMessage id={triggerTypeDesMessageId} tagName='nobr' />
                  }} />
              </div>
              {upperDiv}
              {lowerDiv}
            </div>
          )
        })
        return (
          <div>
            <div className='title'>
              <FormattedMessage id='policy_view_scaling_rules' />
            </div>
            {triggerDivs}
          </div>
        )
      }
    })()

    let schedules = app_policy_data.schedules
    let recurringLength = 0
    let specificLength = 0
    if (schedules) {
      recurringLength = schedules.recurring_schedule ? schedules.recurring_schedule.length : 0
      specificLength = schedules.specific_date ? schedules.specific_date.length : 0
    }

    let scheduleView = (() => {
      if (recurringLength == 0 && specificLength == 0) {
        return null
      } else {
        let recurringScheduleBlock = (() => {
          if (recurringLength == 0) {
            return null
          } else {
            let divs = schedules.recurring_schedule.map((schedule, i) => {
              let repeatType = ''
              let repeats = (() => {
                if (schedule.days_of_week != null || schedule.days_of_week != undefined) {
                  repeatType = 'week'
                  return schedule.days_of_week.map((weekday, j) => {
                    let weekMessageId = 'recurring_weekday_'
                    switch (weekday) {
                      case 1:
                        weekMessageId = weekMessageId + 'monday'
                        break;
                      case 2:
                        weekMessageId = weekMessageId + 'tuesday';
                        break;
                      case 3:
                        weekMessageId = weekMessageId + 'wednesday';
                        break;
                      case 4:
                        weekMessageId = weekMessageId + 'thursday';
                        break;
                      case 5:
                        weekMessageId = weekMessageId + 'friday';
                        break;
                      case 6:
                        weekMessageId = weekMessageId + 'saturday';
                        break;
                      case 7:
                        weekMessageId = weekMessageId + 'sunday';
                        break;
                    }
                    if (j == schedule.days_of_week.length - 2) {
                      return (
                        <span key={j}><FormattedMessage id={weekMessageId} /> <FormattedMessage id='policy_view_recurring_schedule_description_and' /> </span>
                      )
                    } else if (j == schedule.days_of_week.length - 1) {
                      return (
                        <span key={j}><FormattedMessage id={weekMessageId} /></span>
                      )
                    } else {
                      return (
                        <span key={j}><FormattedMessage id={weekMessageId} /><FormattedMessage id='policy_view_recurring_schedule_description_comma' /></span>
                      )
                    }
                  })
                } else if (schedule.days_of_month != null || schedule.days_of_month != undefined) {
                  repeatType = 'month'
                  let days = schedule.days_of_month.map((dayIndex, k) => {
                    let day = (<FormattedMessage id='policy_view_recurring_schedule_description_th' values={{ dayIndex: dayIndex }} />)
                    if (k == schedule.days_of_month.length - 2) {
                      return (
                        <span key={k}>
                          {day}
                          <FormattedMessage id='policy_view_recurring_schedule_description_and' />
                        </span>
                      )
                    } else if (k == schedule.days_of_month.length - 1) {
                      return (
                        <span key={k}>
                          {day}
                        </span>
                      )
                    } else {
                      return (
                        <span key={k}>
                          {day}
                          <FormattedMessage id='policy_view_recurring_schedule_description_comma' />
                        </span>
                      )
                    }
                  })
                  return days
                }
              })()
              repeatType = 'policy_view_recurring_schedule_description_repeat_' + repeatType
              let effectiveRange = (() => {
                if (schedule.start_date && schedule.end_date) {
                  moment.locale(Util.getDefaultLocal())
                  return (
                    <FormattedMessage
                      id='policy_view_recurring_schedule_description_effective'
                      values={{
                        startDate: moment(schedule.start_date).format('LL').replace(',', ' '),
                        endDate: moment(schedule.end_date).format('LL').replace(',', ' '),
                      }}
                    />
                  )
                } else {
                  return ''
                }
              })()
              let initialed = (() => {
                if (schedule.initial_min_instance_count) {
                  return (
                    <FormattedMessage
                      id='policy_view_schedule_description_initialized'
                      values={{
                        initialMinInstance: <span className='bold-num'>{schedule.initial_min_instance_count}</span>,
                      }}
                    />
                  )
                } else {
                  return (
                    <FormattedMessage
                      id='policy_view_schedule_description_not_initialized'
                      values={{
                        initialMinInstance: <span className='bold-num'>{schedule.initial_min_instance_count}</span>,
                      }}
                    />
                  )
                }
              })()
              moment.locale(Util.getDefaultLocal())
              return (
                <div className='rule-des' key={i}>
                  ●&nbsp;&nbsp;&nbsp;
                  <FormattedMessage
                    id='policy_view_recurring_schedule_description'
                    values={
                      {
                        descriptionInitial: initialed,
                        minInstance: <span className='bold-num'>{schedule.instance_min_count}</span>,
                        maxInstance: <span className='bold-num'>{schedule.instance_max_count}</span>,
                        startTime: schedule.start_time,
                        endTime: schedule.end_time,
                        repeatCycle: <span>{repeats}</span>,
                        repeatType: <FormattedMessage id={repeatType} />,
                        effectiveRange: effectiveRange
                      }
                    }
                  />
                </div>
              )
            })
            return (
              <div>
                <div className='sub-title'>
                  <FormattedMessage id='policy_view_recurring_schedules' />
                </div>
                {divs}
              </div>
            )
          }
        })()

        let specificDateBlock = (() => {
          if (specificLength == 0) {
            return null
          } else {
            let divs = schedules.specific_date.map((item, i) => {
              let initialed = (() => {
                if (item.initial_min_instance_count) {
                  return (
                    <FormattedMessage
                      id='policy_view_schedule_description_initialized'
                      values={{
                        initialMinInstance: <span className='bold-num'>{item.initial_min_instance_count}</span>,
                      }}
                    />
                  )
                } else {
                  return (
                    <FormattedMessage
                      id='policy_view_schedule_description_not_initialized'
                      values={{
                        initialMinInstance: <span className='bold-num'>{item.initial_min_instance_count}</span>,
                      }}
                    />
                  )
                }
              })()
              return (
                <div className='rule-des' key={i}>
                  ●&nbsp;&nbsp;&nbsp;
                  <FormattedMessage
                    id='policy_view_specific_date_description'
                    values={
                      {
                        minInstance: <span className='bold-num'>{item.instance_min_count}</span>,
                        maxInstance: <span className='bold-num'>{item.instance_max_count}</span>,
                        descriptionInitial: initialed,
                        startDate: moment(item.start_date_time).format('LLL').replace(',', ' '),
                        endDate: moment(item.end_date_time).format('LLL').replace(',', ' '),
                      }
                    }
                  />
                </div>
              )
            })
            return (
              <div >
                <div className='sub-title'>
                  <FormattedMessage id='policy_view_specific_dates' />
                </div>
                {divs}
              </div>
            )
          }
        })()

        return (
          <div>
            <div className='title'>
              <FormattedMessage
                id='policy_view_schedules_msg'
                values={{ timezone: <FormattedMessage id={schedules.timezone} tagName='nobr' /> }}
              />
            </div>
            {recurringScheduleBlock}
            {specificDateBlock}
          </div>
        )
      }
    })()

    return (
      <div className='policy-des'>
        <div className='rule-des rule-limit' style={{ color: '#5d686f' }}>
          ●&nbsp;&nbsp;&nbsp;
          <FormattedMessage
            id='policy_view_default_limits'
            values={
              {
                minInstCount: <span className='bold-num'>{app_policy_data.instance_min_count}</span>,
                maxInstCount: <span className='bold-num'>{app_policy_data.instance_max_count}</span>
              }
            }
          />
        </div>
        {triggerView}
        {scheduleView}
        <div className='bottom-button'>
          <Button kind='primary' onClick={this.props.onClickEdit}>
            <FormattedMessage id='policy_view_edit_button' />
          </Button>
          <Button
            kind='primary'
            onClick={() => {
              this.setState({ data: this.state.data.set('showJson', true) })
            }}
            style={{ marginLeft: '0.5em' }}>
            <FormattedMessage id='policy_view_json_button' />
          </Button>
          <Button
            style={{ marginLeft: '0.5em' }}
            kind='primary'
            onClick={() => {
              this.props.dispatch(PolicyActions.deletePolicy(this.props.containerViewData.get('app_id')))
            }} >
            <FormattedMessage id='policy_view_delete_button' />
          </Button>
        </div>
        {deleteError}
        <Modal className='as-policy-json' id='modal'
          onFocus={(e) => {
            if (e.target.type != 'button' && e.target.children[0].tagName.toLowerCase() != 'code') {
              this.setState({ data: this.state.data.set('showJson', false) })
            }
          }}
          open={this.state.data.get('showJson')}>
          <LocalCodeSnippet
            type='multi'
            feedbackId='policy_view_json_copy'
            showMoreTextId='policy_view_json_more'
            showLessTextId='policy_view_json_less'
            code={policyJson}
            onClick={() => {
              this.setState({ data: this.state.data.set('showJson', true) })
            }} />
        </Modal>
      </div>
    )
  }
}

export default connect(
  state => ({
    appViewData: state.appViewData,
    containerViewData: state.containerViewData,
  })
)(PolicyView)
