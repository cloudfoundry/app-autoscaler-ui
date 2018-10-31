import nock from 'nock'

import Sources from '../../src/sources'
import Constants from '../../src/constants/Constants'
import TestConstants from '../TestConstants'

nock(Constants.restUrl_base).get(Constants.restUrl_serviceBoundApps.replace('SERVICE_ID', TestConstants.serviceId)).times(2).reply(200, TestConstants.responseResult);
nock(Constants.restUrl_base).get(Constants.restUrl_appPolicy.replace('APP_ID', TestConstants.appId)).reply(200, TestConstants.responseResult);
nock(Constants.restUrl_base).get(Constants.restUrl_appMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', TestConstants.metricName)).query(TestConstants.query).reply(200, TestConstants.responseResult);
nock(Constants.restUrl_base).get(Constants.restUrl_instanceMetrics.replace('APP_ID', TestConstants.appId).replace('METRIC_NAME', TestConstants.metricName)).query(TestConstants.query).reply(200, TestConstants.responseResult);
nock(Constants.restUrl_base).get(Constants.restUrl_appHistory.replace('APP_ID', TestConstants.appId)).query(TestConstants.query).reply(200, TestConstants.responseResult);

describe('default agent test', () => {

  it('should be able to get bound apps data', (done) => {
    Sources.getServiceBoundApps((err, res) => {
      expect(res.status).toBe(200)
      expect(res.body).toEqual(TestConstants.responseResult)
      expect(err).toEqual(null)
      done()
    }, TestConstants.serviceId, TestConstants.query)
  })

  it('should be able to get app policy data', (done) => {
    Sources.getAppPolicy((err, res) => {
      expect(res.status).toBe(200)
      expect(res.body).toEqual(TestConstants.responseResult)
      expect(err).toEqual(null)
      done()
    }, TestConstants.appId)
  })

  it('should be able to get app metrics data', (done) => {
    Sources.getAppMetrics((err, res) => {
      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual(TestConstants.responseResult)
      expect(err).toEqual(null)
      done()
    }, TestConstants.appId, TestConstants.metricName, TestConstants.query)
  })

  it('should be able to get instance metrics data', (done) => {
    Sources.getInstanceMetrics((err, res) => {
      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual(TestConstants.responseResult)
      expect(err).toEqual(null)
      done()
    }, TestConstants.appId, TestConstants.metricName, TestConstants.query)
  })

  it('should be able to get app history data', (done) => {
    Sources.getAppHistory((err, res) => {
      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual(TestConstants.responseResult)
      expect(err).toEqual(null)
      done()
    }, TestConstants.appId, TestConstants.query)
  })

})
