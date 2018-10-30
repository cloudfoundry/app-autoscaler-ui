import nock from 'nock'
import MetricsActions from '../../src/actions/MetricsActions'
import Constants from '../../src/constants/Constants'
import TestConstants from '../TestConstants'
import ActionTypes from '../../src/constants/ActionTypes'

describe('Test for MetricsActions', function () {

  it('get app metrics start', function () {
    expect(MetricsActions.getAppMetricsStart(true).type).toBe(ActionTypes.GET_APP_METRICS_START);
    expect(MetricsActions.getAppMetricsStart(true).loading).toBe(true);
  });

  it('get app metrics success', function () {
    let action = MetricsActions.getAppMetricsSuccess('name', 'unit', 10, TestConstants.responseResult)
    expect(action.type).toBe(ActionTypes.GET_APP_METRICS_SUCCESS);
    expect(action.unit).toBe('unit');
    expect(action.data).toEqual(TestConstants.responseResult);
    expect(action.name).toBe('name');
    expect(action.maxValue).toBe(10);
  });

  it('get app metrics failed', function () {
    let action = MetricsActions.getAppMetricsFailed('name', TestConstants.errorMsg);
    expect(action.type).toBe(ActionTypes.GET_APP_METRICS_FAILED);
    expect(action.name).toEqual('name');
    expect(action.err).toEqual(TestConstants.errorMsg);
  });

  it('get instance metrics start', function () {
    expect(MetricsActions.getInstanceMetricsStart(true).type).toBe(ActionTypes.GET_INSTANCE_METRICS_START);
    expect(MetricsActions.getInstanceMetricsStart(true).loading).toBe(true);
  });

  it('get instance metrics success', function () {
    let action = MetricsActions.getInstanceMetricsSuccess('name', 'unit', 1, 10, TestConstants.responseResult)
    expect(action.type).toBe(ActionTypes.GET_INSTANCE_METRICS_SUCCESS);
    expect(action.unit).toBe('unit');
    expect(action.data).toEqual(TestConstants.responseResult);
    expect(action.name).toBe('name');
    expect(action.maxIndex).toBe(1);
    expect(action.maxValue).toBe(10);
  });

  it('get instance metrics failed', function () {
    let action = MetricsActions.getInstanceMetricsFailed('name', TestConstants.errorMsg);
    expect(action.type).toBe(ActionTypes.GET_INSTANCE_METRICS_FAILED);
    expect(action.name).toEqual('name');
    expect(action.err).toEqual(TestConstants.errorMsg);
  });

  TestConstants.getOkCodes.map((okCode) => {
    it('get instance metrics should return a function and dispatch 2 respective actions---code=' + okCode, (done) => {
      nock(Constants.restUrl_base).get(Constants.restUrl_instanceMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', TestConstants.metricName)).query(TestConstants.query).reply(okCode, TestConstants.responseResult);
      let method = MetricsActions.getMetrics(TestConstants.appId, TestConstants.metricName, 0, true, TestConstants.query)
      let dispatchCount = 0
      expect(method).toBeInstanceOf(Function)
      setTimeout(method((action) => {
        dispatchCount++
        if (dispatchCount == 1) {
          expect(action.type).toEqual(ActionTypes.GET_INSTANCE_METRICS_START)
          expect(action.loading).toEqual(true)
        } else {
          expect(action.type).toEqual(ActionTypes.GET_INSTANCE_METRICS_SUCCESS)
        }
      }), 100)
      setTimeout(() => {
        expect(dispatchCount).toBe(2);
        done()
      }, 100)
    });
  })


  TestConstants.getErrorCodes.map((errorCode) => {
    it('get instance metrics should return a function and dispatch 2 respective actions---code=' + errorCode, (done) => {
      nock(Constants.restUrl_base).get(Constants.restUrl_appMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', TestConstants.metricName)).query(TestConstants.query).reply(errorCode);
      let method = MetricsActions.getMetrics(TestConstants.appId, TestConstants.metricName, 0, false, TestConstants.query)
      let dispatchCount = 0
      expect(method).toBeInstanceOf(Function)
      setTimeout(method((action) => {
        dispatchCount++
        if (dispatchCount == 1) {
          expect(action.type).toEqual(ActionTypes.GET_INSTANCE_METRICS_START)
          expect(action.loading).toEqual(false)
        } else {
          expect(action.type).toEqual(ActionTypes.GET_INSTANCE_METRICS_FAILED)
        }
      }), 100)
      setTimeout(() => {
        expect(dispatchCount).toBe(2);
        done()
      }, 100)
    });
  })

});
