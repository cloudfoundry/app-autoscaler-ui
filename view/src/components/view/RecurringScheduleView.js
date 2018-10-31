import React from 'react'
import { connect } from 'react-redux'
import { ClickableTile, Icon, Tile, DatePicker, DatePickerInput, FormGroup, Button } from 'carbon-components-react'
import LocalToggle from '../local/LocalToggle'
import Util from '../../common/Util'
import LocalRadioButtonGroup from '../local/LocalRadioButtonGroup'
import LocalNumberInput from '../local/LocalNumberInput'
import Constants from '../../constants/Constants';
import moment from 'moment'
import LocalMultiSelectWithTags from '../local/LocalMultiSelectWithTags'
import LocalDropdownV2 from '../local/LocalDropdownV2'
import { FormattedMessage } from 'react-intl'
import LocalTooltip from '../local/LocalTooltip'

const weekDayItems = [
  { id: 1, msgid: 'recurring_weekday_monday' },
  { id: 2, msgid: 'recurring_weekday_tuesday' },
  { id: 3, msgid: 'recurring_weekday_wednesday' },
  { id: 4, msgid: 'recurring_weekday_thursday' },
  { id: 5, msgid: 'recurring_weekday_friday' },
  { id: 6, msgid: 'recurring_weekday_saturday' },
  { id: 7, msgid: 'recurring_weekday_sunday' }
]

let monthDayItems = []
for (let i = 0; i < 31; i++) {
  monthDayItems[i] = {
    id: i + 1,
    text: i + 1
  }
}

const timePickerItems = Util.getDayTimeMap(14)

class RecurringScheduleView extends React.Component {

  constructor(props) {
    super(props)
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  onChangeRepeatOn(key, index, schedules) {
    let selections = key.selectedItems.map((item) => {
      return item.id
    })
    selections = [...new Set(selections)];
    if (schedules[index].days_of_week) {
      schedules[index].days_of_week = selections
    } else {
      schedules[index].days_of_month = selections
    }
    this.props.onChangeRecurringSchedule(schedules)
  }

  onRemoveRepeatOn(key, index, schedules) {
    if (schedules[index].days_of_week) {
      schedules[index].days_of_week.splice(key, 1)
    } else {
      schedules[index].days_of_month.splice(key, 1)
    }
    this.props.onChangeRecurringSchedule(schedules)
  }

  onNumberInputChang(e, schedules, item, fieldName) {
    if (e.target.type == 'number') {
      Util.numberInputUpdate(e.target.value, item, fieldName)
      this.props.onChangeRecurringSchedule(schedules)
    }
  }

  onNumberInputClick(e, type, schedules, item, fieldName) {
    if (type != undefined) {
      let value = Util.numberInputOnclickValue(item[fieldName], type)
      Util.numberInputUpdate(value, item, fieldName)
      this.props.onChangeRecurringSchedule(schedules)
    }
  }

  onChangeEffectiveRange(key, i, schedules) {
    if (schedules[i].start_date) {
      delete schedules[i]['start_date']
      delete schedules[i]['end_date']
    } else {
      schedules[i]['start_date'] = moment().add(1, 'days').format(Constants.MomentFormateDate)
      schedules[i]['end_date'] = moment().add(1, 'days').format(Constants.MomentFormateDate)
    }
    this.props.onChangeRecurringSchedule(schedules)
  }

  onChangeRepeatBy(key, i, schedules) {
    if (key == 'week') {
      delete schedules[i]['days_of_month']
      schedules[i]['days_of_week'] = []
    } else {
      delete schedules[i]['days_of_week']
      schedules[i]['days_of_month'] = []
    }
    this.props.onChangeRecurringSchedule(schedules)
  }

  render() {

    let schedules = this.props.schedules

    let interacts1 = Util.recurringSchedulesOverlapping(schedules, 'days_of_week')
    let interacts2 = Util.recurringSchedulesOverlapping(schedules, 'days_of_month')
    let interacts = Object.assign(interacts1, interacts2)

    let weekDayIds = ['recurring_weekday_monday', 'recurring_weekday_tuesday', 'recurring_weekday_wednesday', 'recurring_weekday_thursday', 'recurring_weekday_thursday', 'recurring_weekday_thursday', 'recurring_weekday_thursday']
    let monthDay = []
    for (let i = 0; i < 31; i++) {
      monthDay[i] = i + 1
    }

    let tiles = schedules.map((item, index) => {
      let repeatSelect = (() => {
        let items = null
        let selectedDays = null
        let selectedItems = []
        if (item.days_of_week) {
          items = weekDayItems
          selectedDays = item.days_of_week
        } else {
          items = monthDayItems
          selectedDays = item.days_of_month
        }
        for (let i = 0; i < selectedDays.length; i++) {
          selectedItems[selectedItems.length] = items[selectedDays[i] - 1]
        }
        let weekselect = (() => {
          if (item.days_of_week) {
            return (
              <LocalMultiSelectWithTags
                id={'recurring-repeat-week-select-' + index}
                labelId={'policy_form_schedule_recurring_repeat_on_select'}
                items={items}
                selectedItems={selectedItems}
                onChange={(key) => { this.onChangeRepeatOn(key, index, schedules) }}
                onRemove={(key) => { this.onRemoveRepeatOn(key, index, schedules) }}
                invalidItems={interacts[index]} />
            )
          } else {
            return null
          }
        })()
        let monthselect = (() => {
          if (item.days_of_month) {
            return (
              <LocalMultiSelectWithTags
                id={'recurring-repeat-month-select-' + index}
                labelId={'policy_form_schedule_recurring_repeat_on_select'}
                items={items}
                selectedItems={selectedItems}
                onChange={(key) => { this.onChangeRepeatOn(key, index, schedules) }}
                onRemove={(key) => { this.onRemoveRepeatOn(key, index, schedules) }}
                invalidItems={interacts[index]} />
            )
          } else {
            return null
          }
        })()
        return (
          <div>
            {weekselect}
            {monthselect}
          </div>
        )
      })()

      let rangerPicker = (() => {
        if (item.start_date) {
          return (
            <div className='form-left' style={{ marginTop: '0.4em' }} >
              <DatePicker
                id='date-picker'
                className={Util.dateIsAfter(moment().format(Constants.MomentFormateDate), item.start_date) ? 'as-data-invalid-container' : ''}
                datePickerType='range'
                dateFormat='Y-m-d'
                onChange={(key) => {
                  item = this.props.schedules[index]
                  item['start_date'] = moment(key[0]).format(Constants.MomentFormateDate)
                  item['end_date'] = moment(key[1]).format(Constants.MomentFormateDate)
                  this.props.onChangeRecurringSchedule(this.props.schedules)
                }}
                locale={Util.getDefaultLocalConcise()}
              >
                <DatePickerInput
                  className='some-class'
                  id='date-picker-input-id'
                  value={item.start_date}
                  onClick={() => { }}
                />
                <DatePickerInput
                  className='some-class'
                  value={item.end_date}
                  id='date-picker-input-id-2'
                  onClick={() => { }}
                />
              </DatePicker>
            </div>
          )
        } else {
          return null
        }
      })()

      return (
        <Tile key={index} className='recurring-tile'>
          <Icon
            name='icon--close'
            className='remove-btn'
            fill='#3d70b2'
            onClick={() => {
              schedules.splice(index, 1)
              this.props.onChangeRecurringSchedule(schedules)
            }} />
          <div className='bx--grid recurring-form'>
            <div className='bx--row'>
              <div className='bx--col-xs-12 bx--col-md-2 parent-element'>
                <div className='recurring-title child-element'>
                  <LocalTooltip
                    labelId='policy_form_schedule_recurring_effective_duration'
                    messageId='policy_form_schedule_recurring_effective_duration_desc' />
                </div>
              </div>
              <div className='bx--col-xs-12 bx--col-md-3'>
                <LocalToggle
                  id={'effective-duration-toggle' + index}
                  className='form-toggle form-left'
                  labelAId='policy_form_schedule_recurring_effective_duration_aways'
                  labelBId='policy_form_schedule_recurring_effective_duration_custom_range'
                  toggled={item.start_date ? true : false}
                  onToggle={(e) => { this.onChangeEffectiveRange(e, index, schedules) }} />
              </div>
              <div className='bx--col-xs-12 bx--col-md-7'>
                {rangerPicker}
              </div>
            </div>
            <div className='bx--row'>
              <div className='bx--col-xs-12 bx--col-md-2 parent-element'>
                <div className='recurring-title child-element'>
                  <LocalTooltip
                    labelId='policy_form_schedule_recurring_repeat_by'
                    messageId='policy_form_schedule_recurring_repeat_by_desc' />
                </div>
              </div>
              <div className='bx--col-xs-12 bx--col-md-10 parent-element'>
                <FormGroup className='child-element' legendText=''>
                  <LocalRadioButtonGroup
                    defaultSelected={item.days_of_week ? 'week' : 'month'}
                    nameid={index}
                    data={[{ value: 'week', labelTextId: 'policy_form_schedule_recurring_repeat_by_week' }, { value: 'month', labelTextId: 'policy_form_schedule_recurring_repeat_by_month' }]}
                    onChange={(key) => {
                      this.onChangeRepeatBy(key, index, schedules)
                    }} />
                </FormGroup>
              </div>
            </div>
            <div className='bx--row'>
              <div className='bx--col-xs-12 bx--col-md-2 parent-element'>
                <div className='recurring-title child-element'>
                  <LocalTooltip
                    labelId='policy_form_schedule_recurring_repeat_on'
                    messageId='policy_form_schedule_recurring_repeat_on_desc' />
                </div>
              </div>
              <div className='bx--col-xs-12 bx--col-md-10'>
                <div className='multi-select-repeat' >
                  {repeatSelect}
                </div>
                {/* {selectedRepeatedDays} */}
              </div>
            </div>
            <div className='bx--row'>
              <div className='bx--col-xs-12 bx--col-md-3 '>
                <div className='bx--grid'>
                  <div className='bx--row'>
                    <div className='bx--col-xs-12 bx--col-md-6 '>
                      <LocalTooltip
                        labelId='policy_form_schedule_recurring_starttime'
                        messageId='policy_form_schedule_recurring_starttime_desc' />
                      <LocalDropdownV2
                        className={Util.timeIsSameOrAfter(item.start_time, item.end_time) ? 'as-data-invalid' : ''}
                        items={timePickerItems}
                        selectedItem={{
                          id: item.start_time,
                          text: item.start_time
                        }}
                        onChange={(key) => {
                          item.start_time = key.selectedItem.id
                          this.props.onChangeRecurringSchedule(schedules)
                        }}
                      />
                    </div>
                    <div className='bx--col-xs-12 bx--col-md-6 '>
                      <LocalTooltip
                        labelId='policy_form_schedule_recurring_endtime'
                        messageId='policy_form_schedule_recurring_endtime_desc' />
                      <LocalDropdownV2
                        className={Util.timeIsSameOrAfter(item.start_time, item.end_time) ? 'as-data-invalid' : ''}
                        items={timePickerItems}
                        selectedItem={{
                          id: item.end_time,
                          text: item.end_time
                        }}
                        onChange={(key) => {
                          item.end_time = key.selectedItem.id
                          this.props.onChangeRecurringSchedule(schedules)
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='bx--col-xs-12 bx--col-md-9 '>
                <div className='bx--grid'>
                  <div className='bx--row'>
                    <div className='bx--col-xs-12 bx--col-md-4 '>
                      <LocalTooltip
                        labelId='policy_form_schedule_recurring_minimum_instance'
                        messageId='policy_form_schedule_recurring_minimum_instance_desc' />
                      <LocalNumberInput
                        className='form-input-12'
                        labelId='policy_form_schedule_recurring_minimum_instance'
                        onChange={(e) => {
                          this.onNumberInputChang(e, schedules, item, 'instance_min_count')
                        }}
                        onClick={(e, type) => {
                          this.onNumberInputClick(e, type, schedules, item, 'instance_min_count')
                        }}
                        min={1}
                        max={item.instance_max_count - 1}
                        value={item.instance_min_count}
                        step={1} />
                    </div>
                    <div className='bx--col-xs-12 bx--col-md-4' style={{ paddingRight: 0 }}>
                      <LocalTooltip
                        labelId='policy_form_schedule_recurring_initial_minimum_instance'
                        messageId='policy_form_schedule_recurring_initial_minimum_instance_desc' />
                      <LocalNumberInput
                        required={false}
                        className='form-input-12'
                        labelId='policy_form_schedule_recurring_initial_minimum_instance'
                        onChange={(e) => {
                          this.onNumberInputChang(e, schedules, item, 'initial_min_instance_count')
                        }}
                        onClick={(e, type) => {
                          this.onNumberInputClick(e, type, schedules, item, 'initial_min_instance_count')
                        }}
                        min={item.instance_min_count}
                        max={item.instance_max_count}
                        value={item.initial_min_instance_count}
                        step={1} />
                    </div>
                    <div className='bx--col-xs-12 bx--col-md-4 '>
                      <LocalTooltip
                        labelId='policy_form_schedule_recurring_maximum_instance'
                        messageId='policy_form_schedule_recurring_maximum_instance_desc' />
                      <LocalNumberInput
                        className='form-input-12'
                        labelId='policy_form_schedule_recurring_maximum_instance'
                        onChange={(e) => {
                          this.onNumberInputChang(e, schedules, item, 'instance_max_count')
                        }}
                        onClick={(e, type) => {
                          this.onNumberInputClick(e, type, schedules, item, 'instance_max_count')
                        }}
                        min={item.instance_min_count + 1}
                        max={Number.MAX_VALUE}
                        value={item.instance_max_count}
                        step={1} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='bx--row' style={{ height: '1.5em' }} />
          </div>
        </Tile>
      )
    })

    return (
      <div className='formTriggersDescription'>
        <div className='sub-title'>
          <FormattedMessage id='policy_view_recurring_schedules' />
        </div>
        {tiles}
        <ClickableTile
          style={{ display: 'none' }}
          handleClick={() => {
            schedules[schedules.length] = Constants.templatePolicy.schedules.recurring_schedule[0]
            this.props.onChangeRecurringSchedule(schedules)
          }}>
          <div className='add-new'>
            <Icon
              name='icon--add'
              fill='#5d686f'
            />
            <FormattedMessage id='policy_form_schedule_recurring_add_button' />
          </div>
        </ClickableTile>
        <Tile className='fake-tile'>
          <Button
            className='policy-form-btn'
            icon='icon--add'
            onClick={() => {
              schedules[schedules.length] = Constants.templatePolicy.schedules.recurring_schedule[0]
              this.props.onChangeRecurringSchedule(schedules)
            }}>
            <FormattedMessage id='policy_form_schedule_recurring_add_button' />
          </Button>
        </Tile>
        {/* <Button
          className='round-button add-button'
          kind='primary'
          onClick={() => {
            schedules[schedules.length] = Constants.templatePolicy.schedules.recurring_schedule[0]
            this.props.onChangeRecurringSchedule(schedules)
          }}
        >
          <FormattedMessage id='policy_form_schedule_recurring_add_button' />
        </Button> */}
      </div>
    )
  }
}

export default connect(
  state => ({
    serviceViewData: state.serviceViewData
  })
)(RecurringScheduleView)