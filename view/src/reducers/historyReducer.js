import Immutable from 'immutable'
import ActionTypes from '../constants/ActionTypes'
import moment from 'moment-timezone'

const defaultHistoryData = Immutable.fromJS({
  loading: false,
  app_history_data: {
    page: 1,
    total_pages: 0,
    total_results: 0,
    resources: []
  },
  app_history_error_msg: '',
  app_history_query: {
    'start-time': '',
    'end-time': '',
    'page': 1,
    'results-per-page': Infinity,
    'order': 'asc',
  },

  selected_options: {
    range: {
      typeIndex: 0,
      from: 0,
      to: 0
    },
    timezoneIndex: moment.tz.names().indexOf(moment.tz.guess()),
    scalingStatusIndex: 0,
    scalingTypeIndex: 0,
    scalingActionIndex: 0,
    perPage: 10
  }
})

function historyData(state = defaultHistoryData, action) {
  switch (action.type) {
    case ActionTypes.GET_APP_HISTORY_SUCCESS:
      return state.set('loading', false).set('app_history_data', Immutable.fromJS(action.data)).set('app_history_query', Immutable.fromJS(action.query)).set('app_history_error_msg', '')
    case ActionTypes.GET_APP_HISTORY_FAILED:
      return state.set('loading', false).set('app_history_data', Immutable.fromJS(defaultHistoryData.get('app_history_data'))).set('app_history_error_msg', action.err)
    case ActionTypes.GET_APP_HISTORY_START:
      return state.set('loading', true)
    case ActionTypes.SET_APP_HISTORY_OPTIONS_SUCCESS:
      return state.set('selected_options', Immutable.fromJS(action.options))
    case ActionTypes.RESET_HISTORY_VIEW:
      return defaultHistoryData
    default:
      return state
  }
}

export default historyData
