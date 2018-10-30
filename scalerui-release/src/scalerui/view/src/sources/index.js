import Constants from '../constants/Constants'
import DefaultAgent from 'superagent'

const baseUrl = Constants.restUrl_base
const csrfTokenName = 'X-CSRF-Token'
const csrfToken = (() => {
  let elements = document.getElementsByName('gorilla.csrf.Token')
  if (elements.length == 1) {
    return elements[0].value
  } else {
    return ''
  }
})()

export default {

  getServiceBoundApps: (callback, serviceId) => {
    let url = baseUrl + Constants.restUrl_serviceBoundApps.replace('SERVICE_ID', serviceId)
    if (csrfToken != '') {
      DefaultAgent.get(url).set(csrfTokenName, csrfToken).end(callback)
    } else {
      DefaultAgent.get(url).end(callback)
    }
  },

  getAppPolicy: (callback, appId) => {
    let url = baseUrl + Constants.restUrl_appPolicy.replace('APP_ID', appId)
    if (csrfToken != '') {
      DefaultAgent.get(url).set(csrfTokenName, csrfToken).end(callback)
    } else {
      DefaultAgent.get(url).end(callback)
    }
  },

  setAppPolicy: (callback, appId, policy) => {
    let url = baseUrl + Constants.restUrl_appPolicy.replace('APP_ID', appId)
    if (csrfToken != '') {
      DefaultAgent.put(url).set(csrfTokenName, csrfToken).send(policy).end(callback)
    } else {
      DefaultAgent.put(url).send(policy).end(callback)
    }
  },

  deleteAppPolicy: (callback, appId) => {
    let url = baseUrl + Constants.restUrl_appPolicy.replace('APP_ID', appId)
    if (csrfToken != '') {
      DefaultAgent.delete(url).set(csrfTokenName, csrfToken).end(callback)
    } else {
      DefaultAgent.delete(url).end(callback)
    }
  },

  getAppMetrics: (callback, appId, metricName, query) => {
    let url = baseUrl + Constants.restUrl_appMetrics.replace('APP_ID', appId).replace('METRIC_NAME', metricName)
    if (csrfToken != '') {
      DefaultAgent.get(url).set(csrfTokenName, csrfToken).query(query).end(callback)
    } else {
      DefaultAgent.get(url).query(query).end(callback)
    }
  },

  getInstanceMetrics: (callback, appId, metricName, query) => {
    let url = baseUrl + Constants.restUrl_instanceMetrics.replace('APP_ID', appId).replace('METRIC_NAME', metricName)
    if (csrfToken != '') {
      DefaultAgent.get(url).set(csrfTokenName, csrfToken).query(query).end(callback)
    } else {
      DefaultAgent.get(url).query(query).end(callback)
    }
  },

  getAppHistory: (callback, appId, query) => {
    let url = baseUrl + Constants.restUrl_appHistory.replace('APP_ID', appId)
    if (csrfToken != '') {
      DefaultAgent.get(url).set(csrfTokenName, csrfToken).query(query).end(callback)
    } else {
      DefaultAgent.get(url).query(query).end(callback)
    }
  },

}
