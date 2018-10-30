import nock from 'nock'
import HistoryActions from '../../src/actions/HistoryActions'
import Constants from '../../src/constants/Constants'
import TestConstants from '../TestConstants'
import ActionTypes from '../../src/constants/ActionTypes'

describe('Test for HistoryActions', function () {

  it('get app history start', function () {
    expect(HistoryActions.getHistoryStart().type).toBe(ActionTypes.GET_APP_HISTORY_START);
  });

  it('get app history success', function () {
    let action = HistoryActions.getHistorySuccess(TestConstants.responseResult)
    expect(action.type).toBe(ActionTypes.GET_APP_HISTORY_SUCCESS);
    expect(action.data).toEqual(TestConstants.responseResult);
  });

  it('get app history failed', function () {
    let action = HistoryActions.getHistoryFailed(TestConstants.errorMsg);
    expect(action.type).toBe(ActionTypes.GET_APP_HISTORY_FAILED);
    expect(action.err).toEqual(TestConstants.errorMsg);
  });

  TestConstants.getOkCodes.map((okCode) => {
    it('get app history should return a function and dispatch 2 respective actions---code=' + okCode, (done) => {
      nock(Constants.restUrl_base).get(Constants.restUrl_appHistory.replace('APP_ID', TestConstants.appId)).query(TestConstants.query).reply(okCode, TestConstants.responseResult);
      let method = HistoryActions.getHistory(TestConstants.appId, TestConstants.query)
      let dispatchCount = 0
      expect(method).toBeInstanceOf(Function)
      setTimeout(method((action) => {
        dispatchCount++
        if (dispatchCount == 1) {
          expect(action.type).toEqual(ActionTypes.GET_APP_HISTORY_START)
        } else {
          expect(action.type).toEqual(ActionTypes.GET_APP_HISTORY_SUCCESS)
        }
      }), 100)
      setTimeout(() => {
        expect(dispatchCount).toBe(2);
        done()
      }, 100)
    });
  })


  TestConstants.getErrorCodes.map((errorCode) => {
    it('get app history should return a function and dispatch 2 respective actions---code=' + errorCode, (done) => {
      nock(Constants.restUrl_base).get(Constants.restUrl_appHistory.replace('APP_ID', TestConstants.appId)).query(TestConstants.query).reply(errorCode);
      let method = HistoryActions.getHistory(TestConstants.appId, TestConstants.query)
      let dispatchCount = 0
      expect(method).toBeInstanceOf(Function)
      setTimeout(method((action) => {
        dispatchCount++
        if (dispatchCount == 1) {
          expect(action.type).toEqual(ActionTypes.GET_APP_HISTORY_START)
        } else {
          expect(action.type).toEqual(ActionTypes.GET_APP_HISTORY_FAILED)
        }
      }), 100)
      setTimeout(() => {
        expect(dispatchCount).toBe(2);
        done()
      }, 100)
    });
  })

});
