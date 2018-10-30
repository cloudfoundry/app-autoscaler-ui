import React from 'react'
import { connect } from 'react-redux'
import { Button, DatePicker, DatePickerInput, Loading } from 'carbon-components-react'
import Immutable from 'immutable'
import { IntlProvider, FormattedMessage } from 'react-intl'
import Locale from '../../common/Locale'
import LocalDropdownV2 from '../local/LocalDropdownV2'
import moment from 'moment-timezone'
import Util from '../../common/Util'
import Constants from '../../constants/Constants'
import HistoryActions from '../../actions/HistoryActions'
import HistoryTable from '../tables/HistoryTable'
import LocalNotification from '../local/LocalNotification'
import LocalPaginationV2 from '../local/LocalPaginationV2'

const PER_PAGE_MAX = 10000

const rangeItems = [
  { id: 'history_page_past_week' },
  { id: 'history_page_past_month' },
  { id: 'history_page_custom_range' },
]

const timezoneItems = moment.tz.names().map((item) => {
  return {
    id: item
  }
})

const scalingStatusItems = [
  { id: 'history_page_scaling_status_any' },
  { id: 'history_page_scaling_status_succeeded' },
  { id: 'history_page_scaling_status_failed' },
  { id: 'history_page_scaling_status_ignored' },
]

const scalingActionItems = [
  { id: 'history_page_scaling_action_any' },
  { id: 'history_page_scaling_action_in' },
  { id: 'history_page_scaling_action_out' },
]

const scalingTypeItems = [
  { id: 'history_page_scaling_type_any' },
  { id: 'history_page_scaling_type_dynamic' },
  { id: 'history_page_scaling_type_schedule' },
]

const timePickerItems = Util.getDayTimeItem(59)

class HistoryView extends React.Component {
  constructor(props) {
    super(props)
    let selectedOptions = this.props.historyData.get('selected_options').toJS()
    this.state = {
      data: Immutable.fromJS({
        query: {
          range: {
            type: rangeItems[selectedOptions.range.typeIndex].id,
            from: this.getRangeBySelection(rangeItems[selectedOptions.range.typeIndex].id, true).from,
            to: this.getRangeBySelection(rangeItems[selectedOptions.range.typeIndex].id, true).to
          },
          timezone: timezoneItems[selectedOptions.timezoneIndex].id,
          scalingStatus: scalingStatusItems[selectedOptions.scalingStatusIndex].id,
          scalingType: scalingTypeItems[selectedOptions.scalingTypeIndex].id,
          scalingAction: scalingActionItems[selectedOptions.scalingActionIndex].id,
          page: 1
        }
      })
    }
    this.submitQuery()
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  submitQuery(page, perPage) {
    let selectedOptions = this.props.historyData.get('selected_options').toJS()
    let query = this.state.data.get('query').toJS()
    selectedOptions.range.typeIndex = this.getSelectedIndex(rangeItems, query.range.type)
    selectedOptions.range.from = this.state.data.get('query').get('range').get('from')
    selectedOptions.range.to = this.state.data.get('query').get('range').get('to')
    selectedOptions.timezoneIndex = this.getSelectedIndex(timezoneItems, query.timezone)
    selectedOptions.scalingStatusIndex = this.getSelectedIndex(scalingStatusItems, query.scalingStatus)
    selectedOptions.scalingTypeIndex = this.getSelectedIndex(scalingTypeItems, query.scalingType)
    selectedOptions.scalingActionIndex = this.getSelectedIndex(scalingActionItems, query.scalingAction)
    this.props.dispatch(HistoryActions.setHistoryOptions(selectedOptions))
    let range = this.getRangeBySelection(selectedOptions)
    let startTime = moment.tz(range.from.format(Constants.MomentFormateDateTime), query.timezone)
    let endTime = moment.tz(range.to.format(Constants.MomentFormateDateTime), query.timezone)
    this.props.dispatch(HistoryActions.getHistory(this.props.containerViewData.get('app_id'), {
      'start-time': startTime * 1000000,
      'end-time': endTime * 1000000,
      'page': page ? page : 1,
      'results-per-page': perPage ? perPage : selectedOptions.perPage,
      'order': 'desc'
    }))
  }

  getSelectedIndex(items, id) {
    let index = -1
    items.map((item, i) => {
      if (item.id == id) {
        index = i
      }
    })
    return index
  }

  onQueryRangeChange(key) {
    let range = this.state.data.get('query').get('range').toJS()
    range.type = key.selectedItem.id
    if (range.type == 'history_page_past_week') {
      range.from = moment().subtract(1, 'weeks').add(1, 'days').startOf('day')
      range.to = moment().add(1, 'days').startOf('day')
    } else if (range.type == 'history_page_past_month') {
      range.from = moment().subtract(1, 'months').add(1, 'days').startOf('day')
      range.to = moment().add(1, 'days').startOf('day')
    }
    let query = this.state.data.get('query').set('range', Immutable.fromJS(range))
    this.setState({ data: this.state.data.set('query', query) })
  }

  onQueryTimezoneChange(key) {
    let query = this.state.data.get('query').set('timezone', key.selectedItem.id)
    this.setState({ data: this.state.data.set('query', query) })
  }

  onQueryScalingStatusChange(key) {
    let query = this.state.data.get('query').set('scalingStatus', key.selectedItem.id)
    this.setState({ data: this.state.data.set('query', query) })
  }

  onQueryScalingActionChange(key) {
    let query = this.state.data.get('query').set('scalingAction', key.selectedItem.id)
    this.setState({ data: this.state.data.set('query', query) })
  }

  onQueryScalingTypeChange(key) {
    let query = this.state.data.get('query').set('scalingType', key.selectedItem.id)
    this.setState({ data: this.state.data.set('query', query) })
  }

  onQueryRangeChangeDate(key, fieldName) {
    let newDate = moment(key[0])
    let preDate = this.state.data.get('query').get('range').get(fieldName)
    newDate.set('hour', preDate.hour())
    newDate.set('minute', preDate.minute())
    let query = this.state.data.get('query').set('range', this.state.data.get('query').get('range').set(fieldName, newDate))
    this.setState({ data: this.state.data.set('query', query) })
  }

  onQueryRangeChangeTime(key, fieldName) {
    let preDate = this.state.data.get('query').get('range').get(fieldName)
    preDate.set('hour', key.selectedItem.id.split(':')[0])
    preDate.set('minute', key.selectedItem.id.split(':')[1])
    let query = this.state.data.get('query').set('range', this.state.data.get('query').get('range').set(fieldName, preDate))
    this.setState({ data: this.state.data.set('query', query) })
  }

  changePerPage(perPage, selectedOptions) {
    if (perPage == 'All') {
      perPage = PER_PAGE_MAX
    }
    this.submitQuery(selectedOptions.page, perPage)
    selectedOptions.perPage = perPage
    this.props.dispatch(HistoryActions.setHistoryOptions(selectedOptions))
  }

  changePage(page) {
    let query = this.state.data.get('query').set('page', page)
    this.setState({ data: this.state.data.set('query', query) })
    this.submitQuery(page)
  }

  getRangeBySelection(rangeSubmit, init) {
    let range = {}
    if (rangeSubmit == 'history_page_past_week') {
      range.from = moment().subtract(1, 'weeks').add(1, 'days').startOf('day')
      range.to = moment().add(1, 'days').startOf('day')
    } else if (rangeSubmit == 'history_page_past_month') {
      range.from = moment().subtract(1, 'months').add(1, 'days').startOf('day')
      range.to = moment().add(1, 'days').startOf('day')
    } else {
      if (init) {
        range = this.props.historyData.get('selected_options').get('range').toJS()
      } else {
        range = this.state.data.get('query').get('range').toJS()
      }
    }
    return range
  }

  render() {

    let loadError = (() => {
      if (this.props.historyData.get('app_history_error_msg') != '') {
        return (
          <LocalNotification
            titleId={[{ id: 'history_page_load_failed' }, {}]}
            subtitle={this.props.historyData.get('app_history_error_msg')}
            kind='error'
          />
        )
      } else {
        return null
      }
    })()

    let selectedOptions = this.props.historyData.get('selected_options').toJS()
    let query = this.state.data.get('query').toJS()
    let disableRangerPicker = true
    if (query.range.type == 'history_page_custom_range') {
      disableRangerPicker = false
    }
    let data = this.props.historyData.get('app_history_data').toJS()
    let records = data.resources
    let range = this.getRangeBySelection(query.range.type)
    let paginationBar = (() => {
      if (records.length == 0) {
        return (
          <center style={{ marginTop: '0.5em' }}>
            <FormattedMessage id={'history_page_no_results'} />
          </center>
        )
      } else {
        return (
          <div className='bx--row'>
            <div className='bx--col-xs-12 bx--col-md-12 query-label'>
              <LocalPaginationV2
                totalItems={data.total_results}
                pageSize={10}
                pageSizes={[
                  10,
                  20,
                  50,
                  100
                ]}
                itemsPerPageTextId='history_page_pagination_per_page'
                itemRangeTextId='history_page_pagination_total_item'
                pageRangeTextId='history_page_pagination_total_page'
                onChange={(e) => {
                  this.changePage(e.page)
                  this.changePerPage(e.pageSize, selectedOptions)
                }}
              />
              {/* <PaginationBar
                className='bar-left'
                currentPage={data.page}
                totalPage={data.total_pages}
                totalResult={data.total_results}
                onClick={(p) => { this.changePage(p) }}
                pageType={'long'}
                pageScope={2}
                showTotal={true} />
              <PerPageBar className='bar-right' onClick={(pp) => { this.changePerPage(pp, selectedOptions) }} selectedOption={selectedOptions.perPage == PER_PAGE_MAX ? 'All' : selectedOptions.perPage} /> */}
            </div>
          </div>
        )
      }
    })()

    return (
      <IntlProvider locale={Util.getDefaultLocal()} messages={Locale.getLocale(Util.getDefaultLocal())}>
        <div className='history-view'>
          <div className='bx--grid'>
            <div className='bx--row'>
              <div className='bx--col-xs-12 bx--col-md-2 query-label'>
                <FormattedMessage id='history_page_time_zone' />
                <LocalDropdownV2
                  items={timezoneItems}
                  selectedItem={timezoneItems[selectedOptions.timezoneIndex]}
                  onChange={(key) => { this.onQueryTimezoneChange(key) }}
                />
              </div>
              <div className='bx--col-xs-12 bx--col-md-2 query-label'>
                <FormattedMessage id='history_page_query_range' />
                <LocalDropdownV2
                  items={rangeItems}
                  selectedItem={rangeItems[selectedOptions.range.typeIndex]}
                  onChange={(key) => { this.onQueryRangeChange(key) }}
                />
              </div>
              <div className='bx--col-xs-12 bx--col-md-3'>
                <div className='bx--grid'>
                  <div className='bx--row'>
                    <div className='bx--col-xs-12 bx--col-md-6 query-label left-block'>
                      <FormattedMessage id='history_page_custom_range_from' />
                      <DatePicker
                        id='date-picker'
                        onChange={(key) => { this.onQueryRangeChangeDate(key, 'from') }}
                        onClick={() => { }}
                        datePickerType='single'
                        short={false}
                        dateFormat='Y-m-d'
                        locale={Util.getDefaultLocalConcise()}
                      >
                        <DatePickerInput
                          disabled={disableRangerPicker}
                          id='date-picker-input-id'
                          onClick={() => { }}
                          onChange={(e) => {
                            if (Util.matchDate(e.target.value)) {
                              this.onQueryRangeChangeDate([e.target.value + ' 00:00:00'], 'from')
                            }
                          }}
                          value={range.from.format(Constants.MomentFormateDate)}
                        />
                      </DatePicker>
                    </div>
                    <div className='bx--col-xs-12 bx--col-md-5 query-label'>
                      <span>&nbsp;</span>
                      <LocalDropdownV2
                        className='form-input-6'
                        disabled={disableRangerPicker}
                        items={timePickerItems}
                        selectedItem={{
                          id: range.from.format(Constants.MomentFormateTime),
                          text: range.from.format(Constants.MomentFormateTime)
                        }}
                        onChange={(key) => { this.onQueryRangeChangeTime(key, 'from') }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='bx--col-xs-12 bx--col-md-3'>
                <div className='bx--grid'>
                  <div className='bx--row'>
                    <div className='bx--col-xs-12 bx--col-md-6 query-label left-block'>
                      <FormattedMessage id='history_page_custom_range_to' />
                      <DatePicker
                        id='date-picker'
                        onChange={(key) => { this.onQueryRangeChangeDate(key, 'to') }}
                        onClick={() => { }}
                        datePickerType='single'
                        short={false}
                        dateFormat='Y-m-d'
                        locale={Util.getDefaultLocalConcise()}
                      >
                        <DatePickerInput
                          disabled={disableRangerPicker}
                          id='date-picker-input-id'
                          value={range.to.format(Constants.MomentFormateDate)}
                          onClick={() => { }}
                          onChange={(e) => {
                            if (Util.matchDate(e.target.value)) {
                              this.onQueryRangeChangeDate([e.target.value + ' 00:00:00'], 'to')
                            }
                          }}
                        />
                      </DatePicker>
                    </div>
                    <div className='bx--col-xs-12 bx--col-md-5 query-label'>
                      <span>&nbsp;</span>
                      <LocalDropdownV2
                        className='form-input-6'
                        disabled={disableRangerPicker}
                        items={timePickerItems}
                        selectedItem={{
                          id: range.to.format(Constants.MomentFormateTime),
                          text: range.to.format(Constants.MomentFormateTime)
                        }}
                        onChange={(key) => { this.onQueryRangeChangeTime(key, 'to') }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='bx--col-xs-12 bx--col-md-2 query-label parent-element'>
                <Button className='round-button child-element-right-bottom' kind='primary' style={{ marginRight: '10px' }} onClick={() => { this.submitQuery() }}>
                  <FormattedMessage id='history_page_query_button' />
                </Button>
              </div>
            </div>
            <div className='bx--row' style={{ display: 'none' }}>
              <div className='bx--col-xs-12 bx--col-md-3 query-label'>
                <FormattedMessage id='history_page_scaling_status' />
                <LocalDropdownV2
                  labelId=''
                  items={scalingStatusItems}
                  selectedItem={scalingStatusItems[selectedOptions.scalingStatusIndex]}
                  onChange={(key) => { this.onQueryScalingStatusChange(key, selectedOptions) }}
                />
              </div>
              <div className='bx--col-xs-12 bx--col-md-3 query-label'>
                <FormattedMessage id='history_page_scaling_type' />
                <LocalDropdownV2
                  items={scalingTypeItems}
                  selectedItem={scalingTypeItems[selectedOptions.scalingTypeIndex]}
                  onChange={(key) => { this.onQueryScalingTypeChange(key, selectedOptions) }}
                />
              </div>
              <div className='bx--col-xs-12 bx--col-md-3 query-label'>
                <FormattedMessage id='history_page_scaling_action' />
                <LocalDropdownV2
                  items={scalingActionItems}
                  selectedItem={scalingActionItems[selectedOptions.scalingActionIndex]}
                  onChange={(key) => { this.onQueryScalingActionChange(key, selectedOptions) }}
                />
              </div>
              <div className='bx--col-xs-12 bx--col-md-3 query-label parent-element'>
                <Button className='round-button child-element-right-bottom' kind='primary' style={{ marginRight: '10px' }} onClick={() => { this.submitQuery() }}>
                  <FormattedMessage id='history_page_query_button' />
                </Button>
              </div>
            </div>
            <div className='bx--row'>
              <div className='bx--col-xs-12 bx--col-md-12' style={{ marginTop: '1em' }}>
                <HistoryTable />
              </div>
            </div>
            {paginationBar}
            {loadError}
          </div>
          <Loading active={this.props.historyData.get('loading')} />
        </div>
      </IntlProvider>
    )
  }
}

export default connect(
  state => ({
    historyData: state.historyData,
    containerViewData: state.containerViewData
  })
)(HistoryView)
