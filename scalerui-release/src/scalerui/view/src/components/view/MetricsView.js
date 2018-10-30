import React from 'react'
import { connect } from 'react-redux'
import { DatePicker, DatePickerInput, Button, Loading } from 'carbon-components-react'
import Immutable from 'immutable'
import { IntlProvider, FormattedMessage } from 'react-intl'
import LocalDropdownV2 from '../local/LocalDropdownV2'
import Locale from '../../common/Locale'
import MetricsActions from '../../actions/MetricsActions'
import Constants from '../../constants/Constants'
import MetricChart from '../charts/MetricChart'
import LocalMultiSelectWithTags from '../local/LocalMultiSelectWithTags'
import MetricTypeUtil from '../../common/MetricTypeUtil'
import Util from '../../common/Util'
import Moment from 'moment'
import { extendMoment } from 'moment-range'
import LocalModal from '../local/LocalModal'
import store from '../../store'
import { Provider } from 'react-redux'

const moment = extendMoment(Moment)
let rangeItems = Constants.query_metrics_range
const timePickerItems = Util.getDayTimeMap(59)

let metricTypeMessageIds = Constants.MetricTypes.map((item) => {
  return {
    id: item,
    msgid: MetricTypeUtil.getMetricOptionDescription(item)
  }
})

class MetricsView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showTimeScopeModal: false
    }
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  onInstanceChange(key, selectedOptions) {
    let instance = (() => {
      if (key.selectedItem.index == undefined) {
        return 'mean'
      } else {
        return key.selectedItem.index
      }
    })()
    selectedOptions.instance = instance
    this.props.dispatch(MetricsActions.setMetricsOptions(selectedOptions))
  }

  onMetricChange(key, selectedOptions) {
    let metricsNames = key.selectedItems.map((item) => {
      return item.id
    })
    selectedOptions.metrics = metricsNames
    this.props.dispatch(MetricsActions.setMetricsOptions(selectedOptions))
  }

  onMetricRemove(key, selectedOptions) {
    selectedOptions.metrics = Immutable.fromJS(selectedOptions.metrics).remove(key).toJS()
    this.props.dispatch(MetricsActions.setMetricsOptions(selectedOptions))
  }

  onQueryRangeChange(key, selectedOptions) {
    if (key.selectedItem.key != Constants.query_metrics_range_custom) {
      selectedOptions.rangeSubmit = key.selectedItem.key
    } else {
      selectedOptions.custom.from = moment().subtract(selectedOptions.rangeSelect, 'minutes')
      selectedOptions.custom.to = moment()
    }
    selectedOptions.rangeSelect = key.selectedItem.key
    this.props.dispatch(MetricsActions.setMetricsOptions(selectedOptions))
  }

  onCustomQueryRangeChange(value, type, fieldName, selectedOptions) {
    let datetime = this.getRangeBySelection(selectedOptions)[fieldName]
    if (type == 'date') {
      let newDate = moment(value)
      datetime.set('year', newDate.year())
      datetime.set('month', newDate.month())
      datetime.set('date', newDate.date())
    } else {
      datetime.set('hour', value.split(':')[0])
      datetime.set('minute', value.split(':')[1])
    }
    selectedOptions.custom[fieldName] = datetime
    this.props.dispatch(MetricsActions.setMetricsOptions(selectedOptions))
  }

  getRangeBySelection(selectedOptions) {
    let rangeSubmit = selectedOptions.rangeSubmit
    let range = {}
    if (rangeSubmit == Constants.query_metrics_range_custom) {
      range['from'] = selectedOptions.custom.from
      range['to'] = selectedOptions.custom.to
    } else {
      range['from'] = moment().subtract(rangeSubmit, 'minutes')
      range['to'] = moment()
    }
    return range
  }

  render() {
    let maxIndex = this.props.metricsData.get('instance_metrics_max_index')
    let instanceItems = [
      { id: 'metrics_page_select_instance_average' }
    ]
    for (let i = 0; i <= maxIndex; i++) {
      instanceItems[i + 1] = { id: 'metrics_page_select_instance_other', index: i }
    }

    let selectedOptions = this.props.metricsData.get('selected_options').toJS()
    let selectedMetricTypeMessageIds = []
    metricTypeMessageIds.map((item) => {
      if (selectedOptions.metrics.indexOf(item.id) >= 0) {
        selectedMetricTypeMessageIds.push(item)
      }
    })

    let selectedInstanceItem = (() => {
      if (selectedOptions.instance == Constants.query_metrics_instance_mean) {
        return instanceItems[0]
      } else {
        return instanceItems[selectedOptions.instance + 1]
      }
    })()

    let rangeSelect = selectedOptions.rangeSelect
    let rangeSubmit = selectedOptions.rangeSubmit
    let selectedRangeItem = []
    rangeItems.map((item) => {
      if (item.key == rangeSelect) {
        selectedRangeItem = item
      }
    })

    let range = this.getRangeBySelection(selectedOptions)
    let customRange = selectedOptions.custom
    let dateTimeRangePicker = (() => {
      if (rangeSelect != Constants.query_metrics_range_custom) {
        return null
      } else {
        return (
          <div>
            <DatePicker
              id='date-picker'
              onChange={(key) => { this.onCustomQueryRangeChange(key[0], 'date', 'from', selectedOptions) }}
              datePickerType='single'
              short={false}
              dateFormat='Y-m-d'
              locale={Util.getDefaultLocalConcise()}
            >
              <DatePickerInput
                id='date-picker-input-id'
                onClick={() => { }}
                onChange={(e) => {
                  if (Util.matchDate(e.target.value)) {
                    this.onCustomQueryRangeChange(e.target.value + ' 00:00:00', 'date', 'from', selectedOptions)
                  }
                }}
                value={customRange.from.format(Constants.MomentFormateDate)}
              />
            </DatePicker>
            <LocalDropdownV2
              className='select-time'
              items={timePickerItems}
              selectedItem={{
                id: customRange.from.format(Constants.MomentFormateTime),
                text: customRange.from.format(Constants.MomentFormateTime)
              }}
              onChange={(key) => { this.onCustomQueryRangeChange(key.selectedItem.id, 'time', 'from', selectedOptions) }}
            />
            <DatePicker
              style={{ marginLeft: '1em' }}
              id='date-picker'
              onChange={(key) => { this.onCustomQueryRangeChange(key[0], 'date', 'to', selectedOptions) }}
              datePickerType='single'
              short={false}
              dateFormat='Y-m-d'
              locale={Util.getDefaultLocalConcise()}
            >
              <DatePickerInput
                id='date-picker-input-id'
                value={customRange.to.format(Constants.MomentFormateDate)}
                onClick={() => { }}
                onChange={(e) => {
                  if (Util.matchDate(e.target.value)) {
                    this.onCustomQueryRangeChange(e.target.value + ' 00:00:00', 'date', 'to', selectedOptions)
                  }
                }}
              />
            </DatePicker>
            <LocalDropdownV2
              className='select-time'
              items={timePickerItems}
              selectedItem={{
                id: customRange.to.format(Constants.MomentFormateTime),
                text: customRange.to.format(Constants.MomentFormateTime)
              }}
              onChange={(key) => { this.onCustomQueryRangeChange(key.selectedItem.id, 'time', 'to', selectedOptions) }}
            />
            <Button
              style={{ marginLeft: '1em' }}
              kind='primary'
              onClick={() => {
                let rangeFromTo = moment.range(customRange.from, customRange.to).duration()
                if (rangeFromTo < Constants.MetricsMinRangeMinutes * 60000 || rangeFromTo > Constants.MetricsMaxRangeMinutes * 60000) {
                  this.state.showTimeScopeModal = true
                  this.setState(this.state)
                } else {
                  selectedOptions.rangeSubmit = Constants.query_metrics_range_custom
                  selectedOptions.submitted = true
                  this.props.dispatch(MetricsActions.setMetricsOptions(selectedOptions))
                }
              }}>
              <FormattedMessage id='history_page_query_button' />
            </Button>
          </div>
        )
      }
    })()

    let scalingRules = null
    if (this.props.appViewData.get('app_policy_data')) scalingRules = this.props.appViewData.get('app_policy_data').get('scaling_rules_map')
    let warnning = []
    let charts = []
    selectedOptions.metrics.map((metricName, i) => {
      let metricPolicy = scalingRules && scalingRules.get(metricName) ? scalingRules.get(metricName).toJS() : null
      let chart = (
        <MetricChart
          key={i}
          selectedIndex={selectedOptions.instance}
          metricName={metricName}
          fromTime={range.from}
          toTime={range.to}
          refresh={rangeSubmit != Constants.query_metrics_range_custom}
        />
      )
      if (selectedOptions.instance != Constants.query_metrics_instance_mean || metricPolicy) {
        charts.push(chart)
      } else {
        warnning.push(chart)
      }
    })

    return (
      <Provider store={store}>
        <IntlProvider locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
          <div className='metrics-view'>
            <Loading active={this.props.metricsData.get('instance_metrics_loading') || this.props.metricsData.get('app_metrics_loading')} />
            <LocalModal
              onFocus={() => {
                this.state.showTimeScopeModal = false
                this.setState(this.state)
              }}
              open={this.state.showTimeScopeModal}
              passiveModal={true}
              modalHeadingId='metrics_page_select_time_range_custom_warning'
            />
            <div className='bx--grid'>
              <div className='bx--row'>
                <div className='bx--col-xs-12 bx--col-md-2 parent-element'>
                  <div className='select-title child-element'>
                    <FormattedMessage id='metrics_page_select_metrics' />
                  </div>
                </div>
                <div className='bx--col-xs-12 bx--col-md-10'>
                  <LocalMultiSelectWithTags
                    id={'metrics-select'}
                    labelId={'metrics_page_select_metrics_selected'}
                    items={metricTypeMessageIds}
                    selectedItems={selectedMetricTypeMessageIds}
                    onChange={(key) => { this.onMetricChange(key, selectedOptions) }}
                    onRemove={(key) => { this.onMetricRemove(key, selectedOptions) }} />
                </div>
              </div>
              <div className='bx--row'>
                <div className='bx--col-xs-12 bx--col-md-2'>
                  <div className='select-title'>
                    <FormattedMessage id='metrics_page_select_instance' />
                  </div>
                </div>
                <div className='bx--col-xs-12 bx--col-md-10'>
                  <LocalDropdownV2
                    className='select-single form-input-12'
                    items={instanceItems}
                    selectedItem={selectedInstanceItem}
                    onChange={(key) => { this.onInstanceChange(key, selectedOptions) }}
                  />
                </div>
              </div>
              <div className='bx--row'>
                <div className='bx--col-xs-12 bx--col-md-2'>
                  <div className='select-title'>
                    <FormattedMessage id='metrics_page_select_time_range' />
                  </div>
                </div>
                <div className='bx--col-xs-12 bx--col-md-2'>
                  <LocalDropdownV2
                    className='select-single inline-block form-input-12'
                    items={rangeItems}
                    selectedItem={selectedRangeItem}
                    onChange={(key) => { this.onQueryRangeChange(key, selectedOptions) }}
                  />
                </div>
                <div className='bx--col-xs-12 bx--col-md-7'>
                  {dateTimeRangePicker}
                </div>
              </div>
              <div className='bx--row'>
                <div className='bx--col-xs-12 bx--col-md-12'>
                  <div className='select-text'>
                    <FormattedMessage id='metrics_page_note' />
                  </div>
                </div>
              </div>
              {warnning}
              {charts}
            </div>
          </div>
        </IntlProvider>
      </Provider>
    )
  }
}

export default connect(
  state => ({
    metricsData: state.metricsData,
    appViewData: state.appViewData,
  })
)(MetricsView)
