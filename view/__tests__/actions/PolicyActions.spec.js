import nock from 'nock'
import PolicyActions from '../../src/actions/PolicyActions'
import Constants from '../../src/constants/Constants'
import TestConstants from '../TestConstants'
import ActionTypes from '../../src/constants/ActionTypes'
import Util from '../../src/common/Util'

describe('Test for PolicyActions', function () {

  it('get app policy start', function () {
    expect(PolicyActions.getPolicyStart().type).toBe(ActionTypes.GET_APP_POLICY_START);
  });

  it('get app policy success', function () {
    let action = PolicyActions.getPolicySuccess(TestConstants.responseResult, true)
    expect(action.type).toBe(ActionTypes.GET_APP_POLICY_SUCCESS);
    expect(action.data).toEqual(TestConstants.responseResult);
  });

  it('get app policy failed', function () {
    let action = PolicyActions.getPolicyFailed(TestConstants.errorMsg);
    expect(action.type).toBe(ActionTypes.GET_APP_POLICY_FAILED);
    expect(action.err).toEqual(TestConstants.errorMsg);
  });

  TestConstants.getOkCodes.map((okCode) => {
    it('get app policy should return a function and dispatch 2 respective actions---code=' + okCode, (done) => {
      nock(Constants.restUrl_base).get(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.appId)).reply(okCode, TestConstants.responseResult);
      let method = PolicyActions.getPolicy(TestConstants.appId, TestConstants.query)
      let dispatchCount = 0
      expect(method).toBeInstanceOf(Function)
      setTimeout(method((action) => {
        dispatchCount++
        if (dispatchCount == 1) {
          expect(action.type).toEqual(ActionTypes.GET_APP_POLICY_START)
        } else {
          expect(action.type).toEqual(ActionTypes.GET_APP_POLICY_SUCCESS)
        }
      }), 100)
      setTimeout(() => {
        expect(dispatchCount).toBe(2);
        done()
      }, 100)
    });
  })


  TestConstants.getErrorCodes.map((errorCode) => {
    it('get app policy should return a function and dispatch 2 respective actions---code=' + errorCode, (done) => {
      nock(Constants.restUrl_base).get(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.appId)).reply(errorCode, TestConstants.responseResult);
      let method = PolicyActions.getPolicy(TestConstants.appId)
      let dispatchCount = 0
      expect(method).toBeInstanceOf(Function)
      setTimeout(method((action) => {
        dispatchCount++
        if (dispatchCount == 1) {
          expect(action.type).toEqual(ActionTypes.GET_APP_POLICY_START)
        } else {
          expect(action.type).toEqual(ActionTypes.GET_APP_POLICY_FAILED)
        }
      }), 100)
      setTimeout(() => {
        expect(dispatchCount).toBe(2);
        done()
      }, 100)
    });
  })

  it('set app policy start', function () {
    expect(PolicyActions.setPolicyStart().type).toBe(ActionTypes.SET_APP_POLICY_START);
  });

  it('set app policy success', function () {
    let action = PolicyActions.setPolicySuccess(TestConstants.responseResult)
    expect(action.type).toBe(ActionTypes.SET_APP_POLICY_SUCCESS);
    expect(action.data).toEqual(TestConstants.responseResult);
  });

  it('set app policy failed', function () {
    let action = PolicyActions.setPolicyFailed(TestConstants.errorMsg);
    expect(action.type).toBe(ActionTypes.SET_APP_POLICY_FAILED);
    expect(action.err).toEqual(TestConstants.errorMsg);
  });

  TestConstants.setOkCodes.map((okCode) => {
    it('set app policy should return a function and dispatch 2 respective actions---code=' + okCode, (done) => {
      nock(Constants.restUrl_base).put(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.appId)).reply(okCode, TestConstants.responseResult);
      let method = PolicyActions.setPolicy(TestConstants.appId, Util.transformArrayToMap(TestConstants.defaultPolicy))
      let dispatchCount = 0
      expect(method).toBeInstanceOf(Function)
      setTimeout(method((action) => {
        dispatchCount++
        if (dispatchCount == 1) {
          expect(action.type).toEqual(ActionTypes.SET_APP_POLICY_START)
        } else {
          expect(action.type).toEqual(ActionTypes.SET_APP_POLICY_SUCCESS)
        }
      }), 100)
      setTimeout(() => {
        expect(dispatchCount).toBe(2);
        done()
      }, 100)
    });
  })

  TestConstants.setErrorCodes.map((errorCode) => {
    it('set app policy should return a function and dispatch 2 respective actions---code=' + errorCode, (done) => {
      nock(Constants.restUrl_base).put(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.appId)).reply(errorCode, TestConstants.responseResult);
      let method = PolicyActions.setPolicy(TestConstants.appId, Util.transformArrayToMap(TestConstants.defaultPolicy))
      let dispatchCount = 0
      expect(method).toBeInstanceOf(Function)
      setTimeout(method((action) => {
        dispatchCount++
        if (dispatchCount == 1) {
          expect(action.type).toEqual(ActionTypes.SET_APP_POLICY_START)
        } else {
          expect(action.type).toEqual(ActionTypes.SET_APP_POLICY_FAILED)
        }
      }), 100)
      setTimeout(() => {
        expect(dispatchCount).toBe(2);
        done()
      }, 100)
    });
  })

  TestConstants.deleteOkCodes.map((okCode) => {
    it('delete app policy should return a function and dispatch 2 respective actions---code=' + okCode, (done) => {
      nock(Constants.restUrl_base).delete(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.appId)).reply(okCode);
      let method = PolicyActions.deletePolicy(TestConstants.appId)
      let dispatchCount = 0
      expect(method).toBeInstanceOf(Function)
      setTimeout(method((action) => {
        dispatchCount++
        if (dispatchCount == 1) {
          expect(action.type).toEqual(ActionTypes.DELETE_APP_POLICY_START)
        } else {
          expect(action.type).toEqual(ActionTypes.DELETE_APP_POLICY_SUCCESS)
        }
      }), 100)
      setTimeout(() => {
        expect(dispatchCount).toBe(2);
        done()
      }, 100)
    });
  })

  TestConstants.deleteErrorCodes.map((errorCode) => {
    it('delete app policy should return a function and dispatch 2 respective actions---code=' + errorCode, (done) => {
      nock(Constants.restUrl_base).put(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.appId)).reply(errorCode);
      let method = PolicyActions.deletePolicy(TestConstants.appId)
      let dispatchCount = 0
      expect(method).toBeInstanceOf(Function)
      setTimeout(method((action) => {
        dispatchCount++
        if (dispatchCount == 1) {
          expect(action.type).toEqual(ActionTypes.DELETE_APP_POLICY_START)
        } else {
          expect(action.type).toEqual(ActionTypes.DELETE_APP_POLICY_FAILED)
        }
      }), 100)
      setTimeout(() => {
        expect(dispatchCount).toBe(2);
        done()
      }, 100)
    });
  })

});
