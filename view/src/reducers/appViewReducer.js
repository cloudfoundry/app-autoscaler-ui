import Immutable from 'immutable'
import ActionTypes from '../constants/ActionTypes'
import Constants from '../constants/Constants'

const defaultAppViewData = Immutable.fromJS({
  loading: false,
  current_view: 'policy',
  next_view: 'policy',
  current_children: 'view',
  show_switch_alert: 0,

  app_policy_save_success: false,
  app_policy_exist: false,
  app_policy_data: {},
  app_policy_error_msg: '',
  app_policy_set_error_msg: '',
  app_policy_set_error_body: [],
  app_policy_delete_error_msg: '',
  app_current_policy_data: {},
})

function appViewData(state = defaultAppViewData, action) {
  switch (action.type) {

    case ActionTypes.GET_APP_POLICY_SUCCESS:
      return state.set('loading', false)
        .set('app_policy_data', Immutable.fromJS(action.data))
        .set('app_policy_exist', true)
        .set('app_policy_error_msg', '')
    case ActionTypes.GET_APP_POLICY_FAILED:
      if (action.err == Constants.PolicyNotExist) {
        return state.set('loading', false)
          .set('app_policy_data', Immutable.fromJS({}))
          .set('app_policy_exist', false)
          .set('app_policy_error_msg', '')
      } else {
        return state.set('loading', false)
          .set('app_policy_data', Immutable.fromJS({}))
          .set('app_policy_exist', false)
          .set('app_policy_error_msg', action.err)
      }
    case ActionTypes.GET_APP_POLICY_START:
      return state.set('loading', true)

    case ActionTypes.SET_APP_POLICY_START:
      return state.set('loading', true)
    case ActionTypes.SET_APP_POLICY_SUCCESS:
      return state.set('loading', false)
        .set('app_policy_data', Immutable.fromJS(action.data))
        .set('app_current_policy_data', Immutable.fromJS(action.data))
        .set('app_policy_exist', true)
        .set('app_policy_set_error_msg', '')
        .set('app_policy_set_error_body', Immutable.fromJS([]))
        .set('app_policy_save_success', true)
    case ActionTypes.SET_APP_POLICY_FAILED:
      let errorMsg = ''
      let errorBody = []
      if (typeof (action.err) == 'string') {
        errorMsg = action.err
      } else {
        errorBody = action.err
      }
      return state.set('loading', false)
        .set('app_policy_set_error_msg', errorMsg)
        .set('app_policy_set_error_body', Immutable.fromJS(errorBody))
        .set('app_policy_save_success', false)
    case ActionTypes.SET_APP_CURRENT_POLICY_SUCCESS:
      return state.set('app_current_policy_data', Immutable.fromJS(action.policy))
        .set('app_policy_set_error_msg', '')
        .set('app_policy_set_error_body', Immutable.fromJS([]))

    case ActionTypes.DELETE_APP_POLICY_SUCCESS:
      return state.set('loading', false)
        .set('app_policy_data', Immutable.fromJS({}))
        .set('app_policy_exist', false)
        .set('app_policy_delete_error_msg', '')
    case ActionTypes.DELETE_APP_POLICY_FAILED:
      return state.set('loading', false)
        .set('app_policy_delete_error_msg', action.err)
    case ActionTypes.DELETE_APP_POLICY_START:
      return state.set('loading', true)
    case ActionTypes.RESET_DELETE_APP_POLICY_ERROR:
      return state.set('app_policy_delete_error_msg', '')

    case ActionTypes.SET_APP_PAGE_CURRENT_VIEW:
      return state.set('current_view', action.view)
    case ActionTypes.SET_APP_PAGE_NEXT_VIEW:
      return state.set('next_view', action.view)
    case ActionTypes.SET_APP_PAGE_CURRENT_CHILDREN:
      return state.set('current_children', action.children)
    case ActionTypes.SET_APP_PAGE_SWITCH_ALERT:
      return state.set('show_switch_alert', action.show)
    case ActionTypes.RESET_APP_PAGE:
      return defaultAppViewData

    default:
      return state
  }
}

export default appViewData
