import React from 'react'
import { Icon, Tile, ClickableTile, Button } from 'carbon-components-react'
import { FormattedMessage } from 'react-intl'
import Constants from '../../constants/Constants'
import MetricTypeUtil from '../../common/MetricTypeUtil'
import LocalNumberInputWithUnit from '../local/LocalNumberInputWithUnit'
import LocalDropdownV2 from '../local/LocalDropdownV2'
import StateNumberInput from '../inputs/StateNumberInput'
import Util from '../../common/Util'
import LocalTooltip from '../local/LocalTooltip'

const adjustmentTypeItems = [
  {
    id: 'policy_form_trigger_adjustment_absolute_option'
  },
  {
    id: 'policy_form_trigger_adjustment_relative_option'
  }
]

class RuleDefineView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      forceClear: false
    }
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  onNumberInputChang(e, policyTriggers, trigger, scaleType, fieldName) {
    if (e.target.type == 'number') {
      this.unifyUpdate(e.target.value, policyTriggers, trigger, scaleType, fieldName)
    }
  }

  onNumberInputClick(e, type, policyTriggers, trigger, scaleType, fieldName) {
    if (type != undefined) {
      let preValue = trigger[fieldName]
      if (preValue == undefined || preValue === '') {
        preValue = 0
      }
      if (fieldName == 'adjustment' && scaleType == 'lower') {
        preValue = -parseInt(trigger[fieldName])
      } else {
        preValue = parseInt(trigger[fieldName])
      }
      let value = Util.numberInputOnclickValue(preValue, type)
      this.unifyUpdate(value, policyTriggers, trigger, scaleType, fieldName)
    }
  }

  unifyUpdate(value, policyTriggers, trigger, scaleType, fieldName) {
    if (fieldName == 'adjustment' && scaleType == 'upper') {
      if (value < 0) value = '' + value
      else if (value >= 0) value = '+' + value
      if (trigger.adjustment && trigger.adjustment.indexOf('%') >= 0) value = value + '%'
      Util.numberInputUpdate(value, trigger, fieldName, true)
    } else if (fieldName == 'adjustment' && scaleType == 'lower') {
      if (value < 0) value = '+' + (-value)
      else if (value >= 0) value = '-' + value
      if (trigger.adjustment && trigger.adjustment.indexOf('%') >= 0) value = value + '%'
      Util.numberInputUpdate(value, trigger, fieldName, true)
    } else {
      Util.numberInputUpdate(value, trigger, fieldName)
    }
    this.props.onChangePolicyTriggers()
  }

  pushOperatorItems(operatorItems, scaleType) {
    let operators = scaleType == 'upper' ? Constants.UpperOperators : Constants.LowerOperators
    operators.map((operator) => {
      operatorItems.push({ id: operator, text: operator })
    })
  }

  render() {
    if (this.state.forceClear) {
      this.setState({ forceClear: false })
      return null
    }
    let policyTriggers = this.props.policyTriggers
    let tiles = policyTriggers.map((trigger, triggerIndex) => {
      let metricType = trigger.metric_type
      let scaleType = Util.getScaleType(trigger)
      let policyEditMessageId = ''
      let instStepCount = ''
      if (scaleType == 'upper') {
        policyEditMessageId = 'policy_form_trigger_scale_up_description'
        if (trigger.adjustment) instStepCount = parseInt(trigger.adjustment)
      } else {
        policyEditMessageId = 'policy_form_trigger_scale_down_description'
        if (trigger.adjustment) instStepCount = -parseInt(trigger.adjustment)
      }

      let selectedAdjustmentItemIndex = 0
      let instStepCountMax = this.props.maxInstance - 1
      if (trigger.adjustment && trigger.adjustment.indexOf('%') >= 0) {
        selectedAdjustmentItemIndex = 1
        if (scaleType == 'upper') {
          instStepCountMax = Number.MAX_VALUE
        } else {
          instStepCountMax = 100
        }
      }

      let metricTypeItems = [
        {
          key: metricType,
          id: MetricTypeUtil.getMetricOptionDescription(metricType)
        }
      ]
      Constants.MetricTypes.map((item) => {
        if (item != metricType) {
          metricTypeItems[metricTypeItems.length] = {
            key: item,
            id: MetricTypeUtil.getMetricOptionDescription(item)
          }
        }
      })

      let operatorItems = []
      this.pushOperatorItems(operatorItems, 'upper')
      this.pushOperatorItems(operatorItems, 'lower')

      let thresholdMin = Util.getThresthodMin(policyTriggers, metricType, scaleType)
      let thresholdMax = (() => {
        let max = Util.getThresthodMax(policyTriggers, metricType, scaleType)
        if (metricType == 'memoryutil' && max > 100) {
          return 100
        } else {
          return max
        }
      })()

      let editTile = (() => {
        if (trigger.expand) {
          return (
            <div className='tileBelowTheFoldContent'>
              <div className='form-group-left sub-title form-group-horizontal'>
                <FormattedMessage id='policy_form_trigger_advanced_configuration' />
              </div>
              <div className='advanced-body bx--grid'>
                <div className='bx--row'>
                  {/* <div className='bx--col-xs-12 bx--col-md-6 form-group-horizontal'>
                    <LocalNumberInputWithUnit
                      className='form-input-12'
                      labelId='policy_form_trigger_statistic_window'
                      unitId='policy_form_trigger_seconds_unit'
                      rangeId='policy_form_trigger_seconds_range'
                      onChange={(e) => {
                        this.onNumberInputChang(e, policyTriggers, trigger, ['lower', 'upper'], 'stat_window_secs')
                      }}
                      onClick={(e, type) => {
                        this.onNumberInputClick(e, type, policyTriggers, trigger, ['lower', 'upper'], 'stat_window_secs')
                      }}
                      min={Constants.policyDefaultSetting.scaling_rules.stat_window_secs_min}
                      max={Constants.policyDefaultSetting.scaling_rules.stat_window_secs_max}
                      value={trigger.stat_window_secs}
                      step={1}
                    />
                  </div> */}
                  <div className='bx--col-xs-12 bx--col-md-12 form-group-horizontal'>
                    <LocalTooltip
                      labelId='policy_form_trigger_cooldown_period'
                      messageId='policy_form_trigger_cooldown_period_desc' />
                    <LocalNumberInputWithUnit className='form-input-10'
                      required={false}
                      unitId='policy_form_trigger_seconds_unit'
                      rangeId='policy_form_trigger_seconds_range'
                      onChange={(e) => {
                        this.onNumberInputChang(e, policyTriggers, trigger, ['upper'], 'cool_down_secs')
                      }}
                      onClick={(e, type) => {
                        this.onNumberInputClick(e, type, policyTriggers, trigger, ['upper'], 'cool_down_secs')
                      }}
                      min={Constants.policyDefaultSetting.scaling_rules.cool_down_secs_min}
                      max={Constants.policyDefaultSetting.scaling_rules.cool_down_secs_max}
                      value={trigger.cool_down_secs}
                      step={1}
                    />
                  </div>
                </div>
              </div>
              <Icon
                name='icon--chevron--up'
                className={'as-expand-icon ' + (trigger.expand ? 'as-expand-icon-show' : 'as-expand-icon-hide')}
                fill='#3d70b2'
                onClick={() => {
                  trigger.expand = !trigger.expand
                  this.props.onChangePolicyTriggers()
                }}
              />
            </div>
          )
        } else {
          return null
        }
      })()

      return (
        <Tile key={triggerIndex} className='trigger-tile'>
          <div className='tileAboveTheFoldContent'>
            <div className='sub-title'>
              {/* <Icon
                name={expandIconName}
                style={{ height: '0.7em', width: '0.7em', marginRight: '0.2em' }}
                fill='#3d70b2'
                onClick={() => {
                  trigger.expand = !trigger.expand
                  this.props.onChangePolicyTriggers()
                }}
              /> */}
              <FormattedMessage
                id='policy_form_trigger_title'
                values={
                  {
                    index: triggerIndex + 1
                  }
                }
              />
              <Icon name='icon--close' fill='#3d70b2' className='remove-btn'
                onClick={(e) => {
                  e.stopPropagation()
                  policyTriggers.splice(triggerIndex, 1)
                  this.props.onChangePolicyTriggers()
                  this.setState({ forceClear: true })
                }} />
            </div>
            <div className='rule-des'>
              <FormattedMessage
                id={policyEditMessageId}
                values={
                  {
                    metricTypeSelect: <div className='form-input-inline form-input-10'><LocalDropdownV2
                      items={metricTypeItems}
                      selectedItem={metricTypeItems[0]}
                      onChange={(key) => {
                        trigger.metric_type = key.selectedItem.key
                        this.props.onChangePolicyTriggers()
                      }}
                    /></div>,
                    conditionSelect: <div className='form-input-inline form-input-5'><LocalDropdownV2
                      items={operatorItems}
                      selectedItem={{ id: trigger.operator, text: trigger.operator }}
                      onChange={(key) => {
                        trigger.operator = key.selectedItem.id
                        this.props.onChangePolicyTriggers()
                      }}
                    /></div>,
                    thresholdInput: <div className='form-input-inline'><StateNumberInput className='form-input-5'
                      id='tj-input'
                      onChange={(e) => {
                        this.onNumberInputChang(e, policyTriggers, trigger, scaleType, 'threshold')
                      }}
                      onClick={(e, type) => {
                        this.onNumberInputClick(e, type, policyTriggers, trigger, scaleType, 'threshold')
                      }}
                      min={thresholdMin}
                      max={thresholdMax}
                      value={trigger.threshold}
                      step={1}
                      invalidText='Number is not valid'
                    /></div>,
                    metricsUnit: <FormattedMessage id={MetricTypeUtil.getMetricUnit(metricType)} tagName='nobr' />,
                    breachDurationInput: <div className='form-input-inline'><StateNumberInput
                      required={false}
                      id='tj-input'
                      className='form-input-5'
                      onChange={(e) => {
                        this.onNumberInputChang(e, policyTriggers, trigger, ['lower', 'upper'], 'breach_duration_secs')
                      }}
                      onClick={(e, type) => {
                        this.onNumberInputClick(e, type, policyTriggers, trigger, ['lower', 'upper'], 'breach_duration_secs')
                      }}
                      min={Constants.policyDefaultSetting.scaling_rules.cool_down_secs_min}
                      max={Constants.policyDefaultSetting.scaling_rules.breach_duration_secs_max}
                      value={trigger.breach_duration_secs}
                      step={1}
                    /></div>,
                    instanceStepCountInput: <div className='form-input-inline'><StateNumberInput
                      className='form-input-5'
                      id='tj-input'
                      onChange={(e) => {
                        this.onNumberInputChang(e, policyTriggers, trigger, scaleType, 'adjustment')
                      }}
                      onClick={(e, type) => {
                        this.onNumberInputClick(e, type, policyTriggers, trigger, scaleType, 'adjustment')
                      }}
                      min={1}
                      max={instStepCountMax}
                      value={instStepCount}
                      step={1}
                    /></div>,
                    adjustmentTypeInput: <div className='form-input-inline form-input-8'><LocalDropdownV2
                      items={adjustmentTypeItems}
                      selectedItem={adjustmentTypeItems[selectedAdjustmentItemIndex]}
                      onChange={(key) => {
                        if (trigger.adjustment) {
                          if (key.selectedItem.id == 'policy_form_trigger_adjustment_relative_option') {
                            trigger.adjustment = trigger.adjustment + '%'
                          } else {
                            trigger.adjustment = trigger.adjustment.replace('%', '')
                          }
                          Util.numberInputUpdate(trigger.adjustment, trigger, 'adjustment', true)
                          this.props.onChangePolicyTriggers()
                        }
                      }}
                    /></div>
                  }
                }
              />
            </div>
            <Icon
              name={'icon--chevron--down'}
              className={'as-expand-icon ' + (trigger.expand ? 'as-expand-icon-hide' : 'as-expand-icon-show')}
              fill='#3d70b2'
              onClick={() => {
                trigger.expand = !trigger.expand
                this.props.onChangePolicyTriggers()
              }}
            />
          </div>
          {editTile}
        </Tile>
      )
    })

    return (
      <div>
        {tiles}
        <ClickableTile
          style={{ display: 'none' }}
          handleClick={() => {
            policyTriggers.push(Constants.templatePolicy.scaling_rules_map['memoryused']['lower'])
            this.props.onChangePolicyTriggers()
          }}>
          <div className='add-new'>
            <Icon
              name='icon--add'
              fill='#5d686f'
            />
            <FormattedMessage id='policy_form_trigger_add_button' />
          </div>
        </ClickableTile>
        <Tile className='fake-tile'>
          <Button
            className='policy-form-btn'
            icon='icon--add'
            onClick={() => {
              policyTriggers.push(Constants.templatePolicy.scaling_rules_map['memoryused']['lower'])
              this.props.onChangePolicyTriggers()
            }}>
            <FormattedMessage id='policy_form_trigger_add_button' />
          </Button>
        </Tile>
        {/* <Button
          className='round-button add-button as-button-uppercase'
          kind='primary'
          onClick={() => {
            policyTriggers.push(Constants.templatePolicy.scaling_rules_map['memoryused']['lower'])
            this.props.onChangePolicyTriggers()
          }}>
          <FormattedMessage id='policy_form_trigger_add_button' />
        </Button> */}
      </div>
    )
  }
}

export default RuleDefineView
