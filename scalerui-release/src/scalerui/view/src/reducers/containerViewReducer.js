import Immutable from 'immutable'
import ActionTypes from '../constants/ActionTypes'

const defaultContainerViewData = Immutable.fromJS({
  app_id: '',
  service_id: '',
  show_header_bar: true
})

function containerViewData(state = defaultContainerViewData, action) {
  switch (action.type) {
    case ActionTypes.SET_CONTAINER_APP_ID:
      return state.set('app_id', action.appId)
    case ActionTypes.SET_CONTAINER_SERVICE_ID:
      return state.set('service_id', action.serviceId)
    case ActionTypes.SET_CONTAINER_SHOW_HEADER_BAR:
      return state.set('show_header_bar', action.show)
    default:
      return state
  }
}

export default containerViewData
