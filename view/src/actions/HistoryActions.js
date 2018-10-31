import ActionTypes from '../constants/ActionTypes'
import Sources from '../sources'

let HistoryActions = {

  setHistoryOptions(options) {
    return {
      type: ActionTypes.SET_APP_HISTORY_OPTIONS_SUCCESS,
      options
    }
  },

  getHistory(appId, query) {
    return function (dispatch) {
      dispatch(HistoryActions.getHistoryStart())
      Sources.getAppHistory((err, res) => {
        if (err && !res) {
          //network error
          dispatch(HistoryActions.getHistoryFailed(err.toString()))
        } else {
          if (res.status == 200) {
            dispatch(HistoryActions.getHistorySuccess(res.body, query))
          } else if (res.status == 401) {
            //unauthorized
            dispatch(HistoryActions.getHistoryFailed(res.status + ' ' + res.statusText))
          } else if (res.status == 403) {
            //unbind
            if (!res.body) {
              dispatch(HistoryActions.getHistoryFailed(res.status + ' ' + res.statusText + ' ' + res.text))
            } else {
              dispatch(HistoryActions.getHistoryFailed(res.body.error))
            }
          } else {
            //other error
            dispatch(HistoryActions.getHistoryFailed(res.status + ' ' + res.statusText + ' ' + JSON.stringify(res.body)))
          }
        }
      }, appId, query)
    }
  },

  getHistoryStart() {
    return {
      type: ActionTypes.GET_APP_HISTORY_START
    }
  },

  getHistorySuccess(data, query) {
    return {
      type: ActionTypes.GET_APP_HISTORY_SUCCESS,
      data,
      query
    }
  },

  getHistoryFailed(err) {
    return {
      type: ActionTypes.GET_APP_HISTORY_FAILED,
      err
    }
  },

  resetHistoryView() {
    return {
      type: ActionTypes.RESET_HISTORY_VIEW
    }
  }

}

export default HistoryActions
