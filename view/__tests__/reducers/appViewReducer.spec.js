import Immutable from 'immutable'
import appViewReducer from '../../src/reducers/appViewReducer'
import ActionTypes from '../../src/constants/ActionTypes'
import TestConstants from '../TestConstants';
import Util from '../../src/common/Util'

const initialAppViewState = Immutable.fromJS({
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

describe('reducers should return the new state after applying the action to the previous state', () => {

  describe('handle unexpected situations', () => {
    it('should return the initial state', () => {
      const action = 'unknown'
      const newState = appViewReducer(undefined, action)
      expect(newState).toEqual(initialAppViewState)
    })
  })

  describe('handle expected actions', () => {
    it('should return new state after applying GET_APP_POLICY_SUCCESS', () => {
      const action = {
        type: ActionTypes.GET_APP_POLICY_SUCCESS,
        data: TestConstants.responseResult,
      }
      const newState = appViewReducer(initialAppViewState, action)
      expect(newState.get('loading')).toBeFalsy()
      expect(newState.get('app_policy_data').toJS()).toEqual(TestConstants.responseResult)
      expect(newState.get('app_policy_exist')).toBeTruthy()
      expect(newState.get('app_policy_error_msg')).toBe('')
    })
    it('should return new state after applying SET_APP_POLICY_FAILED', () => {
      const action = {
        type: ActionTypes.SET_APP_POLICY_FAILED,
        err: TestConstants.errorMsg,
      }
      const newState = appViewReducer(initialAppViewState, action)
      expect(newState.get('loading')).toBeFalsy()
      expect(newState.get('app_policy_save_success')).toBeFalsy()
      expect(newState.get('app_policy_set_error_msg')).toBe(TestConstants.errorMsg)
      expect(Util.isEqual(newState.get('app_policy_set_error_body').toJS(), [])).toBeTruthy()
    })
    it('should return new state after applying SET_APP_POLICY_FAILED', () => {
      const action = {
        type: ActionTypes.SET_APP_POLICY_FAILED,
        err: TestConstants.errorBody
      }
      const newState = appViewReducer(initialAppViewState, action)
      expect(newState.get('loading')).toBeFalsy()
      expect(newState.get('app_policy_save_success')).toBeFalsy()
      expect(newState.get('app_policy_delete_error_msg')).toBe('')
    })
    it('should return new state after applying DELETE_APP_POLICY_FAILED', () => {
      const action = {
        type: ActionTypes.DELETE_APP_POLICY_FAILED,
        err: TestConstants.errorMsg
      }
      const newState = appViewReducer(initialAppViewState, action)
      expect(newState.get('loading')).toBeFalsy()
      expect(newState.get('app_policy_delete_error_msg')).toBe(TestConstants.errorMsg)
    })
  })
})
