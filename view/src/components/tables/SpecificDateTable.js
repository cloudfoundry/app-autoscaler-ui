import React from 'react'
import { connect } from 'react-redux'
import Locale from '../../common/Locale'
import { IntlProvider, FormattedMessage } from 'react-intl'
import moment from 'moment-timezone'
import { DatePicker, DatePickerInput, Icon, ClickableTile, Tile, Button } from 'carbon-components-react'
import Constants from '../../constants/Constants'
import Util from '../../common/Util'
import LocalDropdownV2 from '../local/LocalDropdownV2'
import StateNumberInput from '../inputs/StateNumberInput'
import LocalTooltip from '../local/LocalTooltip'

const timePickerItems = Util.getDayTimeMap(14)

class SpecificDateTable extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  onChangeDate(key, item, schedules, fieldName) {
    let newDate = moment(key[0])
    let preDate = moment(item[fieldName])
    newDate.set('hour', preDate.hour())
    newDate.set('minute', preDate.minute())
    item[fieldName] = newDate.format(Constants.MomentFormateDateTimeT)
    this.props.onChangeSpecificDate(schedules)
  }

  onChangeTime(key, item, schedules, fieldName) {
    let preDate = moment(item[fieldName])
    preDate.set('hour', key.selectedItem.id.split(':')[0])
    preDate.set('minute', key.selectedItem.id.split(':')[1])
    item[fieldName] = preDate.format(Constants.MomentFormateDateTimeT)
    this.props.onChangeSpecificDate(schedules)
  }

  onNumberInputChang(e, schedules, item, fieldName) {
    if (e.target.type == 'number') {
      Util.numberInputUpdate(e.target.value, item, fieldName)
      this.props.onChangeSpecificDate(schedules)
    }
  }

  onNumberInputClick(e, type, schedules, item, fieldName) {
    if (type != undefined) {
      let value = Util.numberInputOnclickValue(item[fieldName], type)
      Util.numberInputUpdate(value, item, fieldName)
      this.props.onChangeSpecificDate(schedules)
    }
  }

  render() {
    let schedules = this.props.schedules
    let timezone = this.props.timezone
    if (!timezone) timezone = 'UTC'
    let confictpairs = Util.specificDateRangeOverlapping(schedules)
    let trs = schedules.map((item, i) => {
      return (
        <tr style={{ padding: 10 }} height='40' key={i}>
          <td className='near' width='14%'>
            <DatePicker
              className={Util.dateTimeIsSameOrAfter(item.start_date_time, item.end_date_time, timezone) || Util.dateTimeIsSameOrAfter(moment().tz(timezone).format(Constants.MomentFormateDateTimeT), item.start_date_time, timezone) || confictpairs[i] ? 'as-data-invalid-container' : ''}
              id={'start-date-picker-' + i}
              onChange={(key) => {
                this.onChangeDate(key, this.props.schedules[i], this.props.schedules, 'start_date_time')
              }}
              datePickerType='single'
              short={false}
              dateFormat='Y-m-d'
              locale={Util.getDefaultLocalConcise()}
            >
              <DatePickerInput
                onClick={() => { }}
                onChange={(e) => {
                  if (Util.matchDate(e.target.value)) {
                    this.onChangeDate([e.target.value + ' 00:00:00'], this.props.schedules[i], this.props.schedules, 'start_date_time')
                  }
                }}
                id='date-picker-input-id'
                value={moment(item.start_date_time).format(Constants.MomentFormateDate)}
              />
            </DatePicker>
          </td>
          <td width='10%'>
            <LocalDropdownV2
              className={(Util.dateTimeIsSameOrAfter(item.start_date_time, item.end_date_time, timezone) || Util.dateTimeIsSameOrAfter(moment().tz(timezone).format(Constants.MomentFormateDateTimeT), item.start_date_time, timezone) || confictpairs[i] ? 'as-data-invalid' : '') + ' form-input-6'}
              items={timePickerItems}
              selectedItem={{
                id: moment(item.start_date_time).format(Constants.MomentFormateTime),
                text: moment(item.start_date_time).format(Constants.MomentFormateTime)
              }}
              onChange={(key) => {
                this.onChangeTime(key, this.props.schedules[i], this.props.schedules, 'start_date_time')
              }}
            />
          </td>
          <td className='near' width='14%'>
            <DatePicker
              id={'end-date-picker-' + i}
              className={Util.dateTimeIsSameOrAfter(item.start_date_time, item.end_date_time, timezone) || Util.dateTimeIsSameOrAfter(moment().tz(timezone).format(Constants.MomentFormateDateTimeT), item.end_date_time, timezone) || confictpairs[i] ? 'as-data-invalid-container' : ''}
              onChange={(key) => {
                this.onChangeDate(key, this.props.schedules[i], this.props.schedules, 'end_date_time')
              }}
              datePickerType='single'
              short={false}
              dateFormat='Y-m-d'
              locale={Util.getDefaultLocalConcise()}
            >
              <DatePickerInput
                onClick={() => { }}
                onChange={(e) => {
                  if (Util.matchDate(e.target.value)) {
                    this.onChangeDate([e.target.value + ' 00:00:00'], this.props.schedules[i], this.props.schedules, 'end_date_time')
                  }
                }}
                value={moment(item.end_date_time).format(Constants.MomentFormateDate)}
                id='date-picker-input-id'
              />
            </DatePicker>
          </td>
          <td width='10%'>
            <LocalDropdownV2
              className={(Util.dateTimeIsSameOrAfter(item.start_date_time, item.end_date_time, timezone) || Util.dateTimeIsSameOrAfter(moment().tz(timezone).format(Constants.MomentFormateDateTimeT), item.end_date_time, timezone) || confictpairs[i] ? 'as-data-invalid' : '') + ' form-input-6'}
              items={timePickerItems}
              selectedItem={{
                id: moment(item.end_date_time).format(Constants.MomentFormateTime),
                text: moment(item.end_date_time).format(Constants.MomentFormateTime)
              }}
              onChange={(key) => {
                this.onChangeTime(key, this.props.schedules[i], this.props.schedules, 'end_date_time')
              }}
            />
          </td>
          <td className='near'>
            <StateNumberInput
              className='form-input-6'
              id='tj-input'
              onChange={(e) => {
                this.onNumberInputChang(e, schedules, item, 'instance_min_count')
              }}
              onClick={(e, type) => {
                this.onNumberInputClick(e, type, schedules, item, 'instance_min_count')
              }}
              min={1}
              max={item.instance_max_count - 1}
              value={item.instance_min_count}
              step={1}
            />
          </td>
          <td className='near'>
            <StateNumberInput
              className='form-input-6'
              required={false}
              id='tj-input'
              onChange={(e) => {
                this.onNumberInputChang(e, schedules, item, 'initial_min_instance_count')
              }}
              onClick={(e, type) => {
                this.onNumberInputClick(e, type, schedules, item, 'initial_min_instance_count')
              }}
              min={item.instance_min_count}
              max={item.instance_max_count}
              value={item.initial_min_instance_count}
              step={1}
            />
          </td>
          <td className='near'>
            <StateNumberInput
              className='form-input-6'
              id='tj-input'
              onChange={(e) => {
                this.onNumberInputChang(e, schedules, item, 'instance_max_count')
              }}
              onClick={(e, type) => {
                this.onNumberInputClick(e, type, schedules, item, 'instance_max_count')
              }}
              min={item.instance_min_count + 1}
              max={Number.MAX_VALUE}
              value={item.instance_max_count}
              step={1}
            />
          </td>
          <td className='near'>
            <Icon
              id={'removeIcon' + i}
              name='icon--close--glyph'
              fill='#3d70b2'
              onClick={() => {
                schedules.splice(i, 1)
                this.props.onChangeSpecificDate(schedules)
              }}
            />
          </td>
        </tr>
      )
    })

    return (
      <IntlProvider className='index' locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
        <div className='specific-form'>
          <div className='formTriggersDescription'>
            <div className='sub-title'>
              <FormattedMessage id='policy_view_specific_dates' />
            </div>
          </div>
          <div className='rule-des'>
            <FormattedMessage id='policy_form_schedule_specific_overlap_warning' />
          </div>
          <table style={{ borderWidth: 10, borderColor: 'black', width: '100%', marginTop: '0.25em' }}>
            <thead>
              <tr className='recurring-title'>
                <th width='24%' colSpan={2}>
                  <LocalTooltip
                    id='input_startdatetime_tooltip'
                    labelId='policy_form_schedule_specific_start_date_time'
                    messageId='policy_form_schedule_specific_start_date_time_desc' />
                </th>
                <th width='24%' colSpan={2}>
                  <LocalTooltip
                    id='input_enddatetime_tooltip'
                    labelId='policy_form_schedule_specific_end_date_time'
                    messageId='policy_form_schedule_specific_end_date_time_desc' />
                </th>
                <th width='16%'>
                  <LocalTooltip
                    id='input_schedule_minimum_tooltip'
                    labelId='policy_form_schedule_recurring_minimum_instance'
                    messageId='policy_form_schedule_recurring_minimum_instance_desc' />
                </th>
                <th width='16%'>
                  <LocalTooltip
                    id='input_schedule_initial_minimum_tooltip'
                    labelId='policy_form_schedule_recurring_initial_minimum_instance'
                    messageId='policy_form_schedule_recurring_initial_minimum_instance_desc' />
                </th>
                <th width='16%'>
                  <LocalTooltip
                    id='input_schedule_maximum_tooltip'
                    labelId='policy_form_schedule_recurring_maximum_instance'
                    messageId='policy_form_schedule_recurring_maximum_instance_desc' />
                </th>
                <th width='4%'>
                  <FormattedMessage id='policy_form_schedule_specific_remove_button' />
                </th>
              </tr>
            </thead>
            <tbody>
              {trs}
            </tbody>
          </table>
          <ClickableTile
            style={{display: 'none'}}
            handleClick={() => {
              let newSpecificDate = Constants.templatePolicy.schedules.specific_date[0]
              let nextStartDateTime = moment().add(1, 'days')
              let nextEndDateTime = moment().add(1, 'days')
              nextStartDateTime.set('hour', moment(newSpecificDate.start_date_time).hour())
              nextStartDateTime.set('minute', moment(newSpecificDate.start_date_time).minute())
              nextEndDateTime.set('hour', moment(newSpecificDate.end_date_time).hour())
              nextEndDateTime.set('minute', moment(newSpecificDate.end_date_time).minute())
              newSpecificDate.start_date_time = nextStartDateTime.format(Constants.MomentFormateDateTimeT)
              newSpecificDate.end_date_time = nextEndDateTime.format(Constants.MomentFormateDateTimeT)
              schedules[schedules.length] = newSpecificDate
              this.props.onChangeSpecificDate(schedules)
            }}>
            <div className='add-new'>
              <Icon
                name='icon--add'
                fill='#5d686f'
              />
              <FormattedMessage id='policy_form_schedule_specific_add_button' />
            </div>
          </ClickableTile>
          <Tile className='fake-tile'>
            <Button
              className='policy-form-btn'
              icon='icon--add'
              onClick={() => {
                let newSpecificDate = Constants.templatePolicy.schedules.specific_date[0]
                let nextStartDateTime = moment().add(1, 'days')
                let nextEndDateTime = moment().add(1, 'days')
                nextStartDateTime.set('hour', moment(newSpecificDate.start_date_time).hour())
                nextStartDateTime.set('minute', moment(newSpecificDate.start_date_time).minute())
                nextEndDateTime.set('hour', moment(newSpecificDate.end_date_time).hour())
                nextEndDateTime.set('minute', moment(newSpecificDate.end_date_time).minute())
                newSpecificDate.start_date_time = nextStartDateTime.format(Constants.MomentFormateDateTimeT)
                newSpecificDate.end_date_time = nextEndDateTime.format(Constants.MomentFormateDateTimeT)
                schedules[schedules.length] = newSpecificDate
                this.props.onChangeSpecificDate(schedules)
              }}>
              <FormattedMessage id='policy_form_schedule_specific_add_button' />
            </Button>
          </Tile>
          {/* <Button
            className='round-button add-button as-button-uppercase'
            kind='primary'
            onClick={() => {
              let newSpecificDate = Constants.templatePolicy.schedules.specific_date[0]
              let nextStartDateTime = moment().add(1, 'days')
              let nextEndDateTime = moment().add(1, 'days')
              nextStartDateTime.set('hour', moment(newSpecificDate.start_date_time).hour())
              nextStartDateTime.set('minute', moment(newSpecificDate.start_date_time).minute())
              nextEndDateTime.set('hour', moment(newSpecificDate.end_date_time).hour())
              nextEndDateTime.set('minute', moment(newSpecificDate.end_date_time).minute())
              newSpecificDate.start_date_time = nextStartDateTime.format(Constants.MomentFormateDateTimeT)
              newSpecificDate.end_date_time = nextEndDateTime.format(Constants.MomentFormateDateTimeT)
              schedules[schedules.length] = newSpecificDate
              this.props.onChangeSpecificDate(schedules)
            }}
          >
            <FormattedMessage id='policy_form_schedule_specific_add_button' />
          </Button> */}
        </div>
      </IntlProvider>
    )
  }
}

export default connect(
  state => ({
    serviceViewData: state.serviceViewData
  })
)(SpecificDateTable)
