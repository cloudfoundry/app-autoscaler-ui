import ActionTypes from '../constants/ActionTypes'

let ContainerActions  = {

  setAppId(appId) {
    return {
      type: ActionTypes.SET_CONTAINER_APP_ID,
      appId
    }
  },

  setServiceId(serviceId) {
    return {
      type: ActionTypes.SET_CONTAINER_SERVICE_ID,
      serviceId
    }
  },

  setShowHeaderBar(show) {
    return {
      type: ActionTypes.SET_CONTAINER_SHOW_HEADER_BAR,
      show
    }
  },

}

export default ContainerActions
