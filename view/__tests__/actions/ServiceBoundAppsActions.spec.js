import nock from 'nock'
import ServiceBoundAppsActions from '../../src/actions/ServiceBoundAppsActions'
import Constants from '../../src/constants/Constants'
import TestConstants from '../TestConstants'
import ActionTypes from '../../src/constants/ActionTypes'

describe('test for ServiceBoundAppsActions', function () {

  it('get service bound apps start', function () {
    let type = ServiceBoundAppsActions.getServiceBoundAppsStart().type;
    expect(type).toBe(ActionTypes.GET_SERVICE_BOUND_APPS_START);
  });

  it('get service bound apps success', function () {
    let result = ServiceBoundAppsActions.getServiceBoundAppsSuccess(TestConstants.responseResult)
    expect(result.type).toBe(ActionTypes.GET_SERVICE_BOUND_APPS_SUCCESS);
    expect(result.data).toEqual(TestConstants.responseResult);
  });

  it('get service bound apps failed', function () {
    let result = ServiceBoundAppsActions.getServiceBoundAppsFailed(TestConstants.responseResult);
    expect(result.type).toBe(ActionTypes.GET_SERVICE_BOUND_APPS_FAILED);
    expect(result.err).toEqual(TestConstants.responseResult);
  });

  it('service view page reset', function () {
    let result = ServiceBoundAppsActions.serviceViewPageReset();
    expect(result.type).toBe(ActionTypes.SERVICE_VIEW_PAGE_RESET);
  });

  it('get service bound apps should be exported as a function and return a function', () => {
    let method = ServiceBoundAppsActions.getServiceBoundApps(TestConstants.serviceId)
    expect(method).toBeInstanceOf(Function)
  });

  TestConstants.getOkCodes.map((okCode) => {
    it('get service bound apps should return a function and dispatch 2 respective actions---code=' + okCode, (done) => {
      nock(Constants.restUrl_base).get(Constants.restUrl_serviceBoundApps.replace('SERVICE_ID', TestConstants.serviceId)).reply(okCode, TestConstants.responseResult);
      let method = ServiceBoundAppsActions.getServiceBoundApps(TestConstants.serviceId)
      let dispatchCount = 0
      expect(method).toBeInstanceOf(Function)
      setTimeout(method((action) => {
        dispatchCount++
        if (dispatchCount == 1) {
          expect(action.type).toEqual(ActionTypes.GET_SERVICE_BOUND_APPS_START)
        } else {
          expect(action.type).toEqual(ActionTypes.GET_SERVICE_BOUND_APPS_SUCCESS)
        }
      }), 100)
      setTimeout(() => {
        expect(dispatchCount).toBe(2);
        done()
      }, 100)
    });
  })


  TestConstants.getErrorCodes.map((errorCode) => {
    it('get service bound apps should return a function and dispatch 2 respective actions---code=' + errorCode, (done) => {
      nock(Constants.restUrl_base).get(Constants.restUrl_serviceBoundApps.replace('SERVICE_ID', TestConstants.serviceId)).reply(errorCode);
      let method = ServiceBoundAppsActions.getServiceBoundApps(TestConstants.serviceId)
      let dispatchCount = 0
      expect(method).toBeInstanceOf(Function)
      setTimeout(method((action) => {
        dispatchCount++
        if (dispatchCount == 1) {
          expect(action.type).toEqual(ActionTypes.GET_SERVICE_BOUND_APPS_START)
        } else {
          expect(action.type).toEqual(ActionTypes.GET_SERVICE_BOUND_APPS_FAILED)
        }
      }), 100)
      setTimeout(() => {
        expect(dispatchCount).toBe(2);
        done()
      }, 100)
    });
  })

});
