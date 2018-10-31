import Immutable from 'immutable'
import ActionTypes from '../constants/ActionTypes'

const defaultServiceViewData = Immutable.fromJS({
  loading: false,
  bound_apps_data: [],
  bound_apps_error_msg: '',
})

function serviceViewData(state = defaultServiceViewData, action) {
  switch (action.type) {
    case ActionTypes.GET_SERVICE_BOUND_APPS_SUCCESS:
      return state.set('loading', false).set('bound_apps_data', Immutable.fromJS(action.data)).set('bound_apps_error_msg', '')
    case ActionTypes.GET_SERVICE_BOUND_APPS_FAILED:
      return state.set('loading', false).set('bound_apps_data', Immutable.fromJS([])).set('bound_apps_error_msg', action.err)
    case ActionTypes.GET_SERVICE_BOUND_APPS_START:
      return state.set('loading', true)
    default:
      return state
  }
}

export default serviceViewData
