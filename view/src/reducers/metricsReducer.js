import Immutable from 'immutable'
import ActionTypes from '../constants/ActionTypes'
import Constants from '../constants/Constants'

const defaultMetricsData = Immutable.fromJS({
  instance_metrics_loading: false,
  instance_metrics_max_index: -1,
  instance_metrics_data: {},

  app_metrics_loading: false,
  app_metrics_data: {},

  metrics_error_msg: {},

  metrics_query: {
    'start-time': '',
    'end-time': '',
    'page': 1,
    'results-per-page': Infinity,
    'order': 'asc',
  },

  selected_options: {
    metrics: [Constants.MetricTypes[0]],
    instance: Constants.query_metrics_instance_mean,
    rangeSelect: Constants.query_metrics_range[0].key,
    rangeSubmit: Constants.query_metrics_range[0].key,
    custom: {
      from: 0,
      to: 0
    },
    submitted: false
  }

})

function metricsData(state = defaultMetricsData, action) {
  let currentMetrics
  let appMtricsError
  switch (action.type) {
    case ActionTypes.GET_INSTANCE_METRICS_SUCCESS:
      currentMetrics = state.get('instance_metrics_data').set(action.name, Immutable.fromJS(({ unit: action.unit, max: action.maxValue, maxIndex: action.maxIndex, data: action.data })))
      appMtricsError = state.get('metrics_error_msg').set(action.name, '')
      let maxIndex = getMaxIndex(currentMetrics.toJS())
      return state.set('instance_metrics_loading', false).set('instance_metrics_data', currentMetrics).set('instance_metrics_max_index', maxIndex).set('metrics_error_msg', appMtricsError).set('metrics_query', Immutable.fromJS(action.query))
    case ActionTypes.GET_INSTANCE_METRICS_FAILED:
      currentMetrics = state.get('instance_metrics_data').set(action.name, Immutable.fromJS(({})))
      appMtricsError = state.get('metrics_error_msg').set(action.name, action.err)
      return state.set('instance_metrics_loading', false).set('instance_metrics_data', currentMetrics).set('metrics_error_msg', appMtricsError)
    case ActionTypes.GET_INSTANCE_METRICS_START:
      return state.set('instance_metrics_loading', action.loading)

    case ActionTypes.GET_APP_METRICS_SUCCESS:
      currentMetrics = state.get('app_metrics_data').set(action.name, Immutable.fromJS(({ unit: action.unit, max: action.maxValue, data: action.data })))
      appMtricsError = state.get('metrics_error_msg').set(action.name, '')
      return state.set('app_metrics_loading', false).set('app_metrics_data', currentMetrics).set('metrics_error_msg', appMtricsError).set('metrics_query', Immutable.fromJS(action.query))
    case ActionTypes.GET_APP_METRICS_FAILED:
      currentMetrics = state.get('app_metrics_data').set(action.name, Immutable.fromJS(({})))
      appMtricsError = state.get('metrics_error_msg').set(action.name, action.err)
      return state.set('app_metrics_loading', false).set('app_metrics_data', currentMetrics).set('metrics_error_msg', appMtricsError)
    case ActionTypes.GET_APP_METRICS_START:
      return state.set('app_metrics_loading', action.loading)

    case ActionTypes.SET_INITIAL_METRICS_OPTIONS_SUCCESS:
      let currentOptions = state.get('selected_options').set('metrics', Immutable.fromJS((action.metrics)))
      return state.set('selected_options', Immutable.fromJS(currentOptions))
    case ActionTypes.SET_METRICS_OPTIONS_SUCCESS:
      return state.set('selected_options', Immutable.fromJS(action.options))
    case ActionTypes.RESET_METRICS_VIEW:
      return defaultMetricsData
    default:
      return state
  }
}

function getMaxIndex(currentMetrics) {
  let maxIndex = -1
  Object.keys(currentMetrics).map((metricName) => {
    maxIndex = maxIndex >= currentMetrics[metricName].maxIndex ? maxIndex : currentMetrics[metricName].maxIndex
  })
  return maxIndex
}

export default metricsData
