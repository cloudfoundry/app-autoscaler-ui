import ActionTypes from '../constants/ActionTypes'

let AppActions  = {

  setAppPageCurrentView(view) {
    return {
      type: ActionTypes.SET_APP_PAGE_CURRENT_VIEW,
      view
    }
  },

  setAppPageNextView(view) {
    return {
      type: ActionTypes.SET_APP_PAGE_NEXT_VIEW,
      view
    }
  },

  setAppPageCurrentChildren(children) {
    return {
      type: ActionTypes.SET_APP_PAGE_CURRENT_CHILDREN,
      children
    }
  },

  setAppPageSwitchAlert(show) {
    return {
      type: ActionTypes.SET_APP_PAGE_SWITCH_ALERT,
      show
    }
  },

  resetAppPage() {
    return {
      type: ActionTypes.RESET_APP_PAGE
    }
  }

}

export default AppActions
