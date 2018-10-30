
import ActionTypes from '../constants/ActionTypes'
import Sources from '../sources'

let ServiceBoundAppsActions = {
  getServiceBoundApps(serviceId) {
    return function (dispatch) {
      dispatch(ServiceBoundAppsActions.getServiceBoundAppsStart())
      Sources.getServiceBoundApps((err, res) => {
        if (err && res == null) {
          dispatch(ServiceBoundAppsActions.getServiceBoundAppsFailed(err.toString()))
        } else {
          if (res.status == 200) {
            dispatch(ServiceBoundAppsActions.getServiceBoundAppsSuccess(res.body.applications))
          } else if (res.status == 400) {
            dispatch(ServiceBoundAppsActions.getServiceBoundAppsFailed(res.body.error))
          } else if (res.status == 401) {
            dispatch(ServiceBoundAppsActions.getServiceBoundAppsFailed(res.status + ' ' + res.statusText))
          } else if (res.status == 403) {
            if (!res.body) {
              dispatch(ServiceBoundAppsActions.getServiceBoundAppsFailed(res.status + ' ' + res.statusText + ' ' + res.text))
            } else {
              dispatch(ServiceBoundAppsActions.getServiceBoundAppsFailed(res.body.error))
            }
          } else if (res.status == 500) {
            dispatch(ServiceBoundAppsActions.getServiceBoundAppsFailed(res.body.description))
          } else {
            dispatch(ServiceBoundAppsActions.getServiceBoundAppsFailed(res.status + ' ' + res.statusText + ' ' + JSON.stringify(res.body)))
          }
        }
      }, serviceId)
      return 1
    }
  },

  getServiceBoundAppsStart() {
    return {
      type: ActionTypes.GET_SERVICE_BOUND_APPS_START
    }
  },

  getServiceBoundAppsSuccess(data) {
    return {
      type: ActionTypes.GET_SERVICE_BOUND_APPS_SUCCESS,
      data
    }
  },

  getServiceBoundAppsFailed(err) {
    return {
      type: ActionTypes.GET_SERVICE_BOUND_APPS_FAILED,
      err
    }
  },

  serviceViewPageReset() {
    return {
      type: ActionTypes.SERVICE_VIEW_PAGE_RESET
    }
  }

}

export default ServiceBoundAppsActions
