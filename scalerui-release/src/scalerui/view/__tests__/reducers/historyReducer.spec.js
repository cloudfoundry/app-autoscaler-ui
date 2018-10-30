import React from 'react'
import Immutable from 'immutable'
import historyReducer from '../../src/reducers/historyReducer'
import ActionTypes from '../../src/constants/ActionTypes'
import TestConstants from '../TestConstants';
import Util from '../../src/common/Util'
import moment from 'moment'

const initialHistoryState = Immutable.fromJS({
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

describe('reducers should return the new state after applying the action to the previous state', () => {

  describe('handle unexpected situations', () => {
    it('should return the initial state', () => {
      const action = 'unknown'
      const newState = historyReducer(undefined, action)
      expect(newState).toEqual(initialHistoryState)
    })
  })

  describe('handle expected actions', () => {
    it('should return new state after applying GET_APP_HISTORY_FAILED', () => {
      const action = {
        type: ActionTypes.GET_APP_HISTORY_FAILED,
        err: TestConstants.errorBody
      }
      const newState = historyReducer(initialHistoryState, action)
      expect(newState.get('loading')).toBeFalsy()
      expect(Util.isEqual(newState.get('app_history_data').toJS(), initialHistoryState.get('app_history_data').toJS())).toBeTruthy()
      expect(newState.get('app_history_error_msg')).toBe(TestConstants.errorBody)
    })
  })
})
