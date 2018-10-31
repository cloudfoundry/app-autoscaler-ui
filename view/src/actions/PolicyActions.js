import ActionTypes from '../constants/ActionTypes'
import Sources from '../sources'
import Util from '../common/Util'
import Constants from '../constants/Constants'
import MetricsActions from './MetricsActions'

let PolicyActions = {
  getPolicy(appId, query) {
    return function (dispatch) {
      dispatch(PolicyActions.getPolicyStart())
      Sources.getAppPolicy((err, res) => {
        if (err && !res) {
          //network error
          dispatch(PolicyActions.getPolicyFailed(err.toString()))
        } else {
          if (res.status == 200) {
            let policy = res.body
            dispatch(PolicyActions.getPolicySuccess(Util.transformArrayToMap(policy)))
            let metricNames = Object.keys(Util.transformArrayToMap(policy).scaling_rules_map)
            if (metricNames && metricNames.length > 0) {
              dispatch(MetricsActions.setInitialMetricsOptions(metricNames))
            }
          } else if (res.status == 401) {
            //unauthorized
            dispatch(PolicyActions.getPolicyFailed(res.status + ' ' + res.statusText))
          } else if (res.status == 403) {
            //unbind
            if (!res.body) {
              dispatch(PolicyActions.getPolicyFailed(res.status + ' ' + res.statusText + ' ' + res.text))
            } else {
              dispatch(PolicyActions.getPolicyFailed(res.body.error))
            }
          } else if (res.status == 404) {
            //no policy
            dispatch(PolicyActions.getPolicyFailed(Constants.PolicyNotExist))
          } else {
            //other error
            dispatch(PolicyActions.getPolicyFailed(res.status + ' ' + res.statusText + ' ' + JSON.stringify(res.body)))
          }
        }
      }, appId, query)
    }
  },

  getPolicyStart() {
    return {
      type: ActionTypes.GET_APP_POLICY_START
    }
  },

  getPolicySuccess(data) {
    return {
      type: ActionTypes.GET_APP_POLICY_SUCCESS,
      data
    }
  },

  getPolicyFailed(err) {
    return {
      type: ActionTypes.GET_APP_POLICY_FAILED,
      err
    }
  },

  setPolicy(appId, policyMap) {
    return function (dispatch) {
      dispatch(PolicyActions.setPolicyStart())
      Sources.setAppPolicy((err, res) => {
        if (err && res == null) {
          dispatch(PolicyActions.setPolicyFailed(err.toString(), []))
        } else {
          if (res.status == 200 || res.status == 201) {
            let newPolicy = res.body
            dispatch(PolicyActions.setPolicySuccess(Util.transformArrayToMap(newPolicy)))
          } else if (res.status == 400) {
            dispatch(PolicyActions.setPolicyFailed(res.body.error))
          } else if (res.status == 401) {
            dispatch(PolicyActions.setPolicyFailed(res.status + ' ' + res.statusText))
          } else if (res.status == 403) {
            if (!res.body) {
              dispatch(PolicyActions.setPolicyFailed(res.status + ' ' + res.statusText + ' ' + res.text))
            } else {
              dispatch(PolicyActions.setPolicyFailed(res.body.error))
            }
          } else {
            dispatch(PolicyActions.setPolicyFailed(res.status + ' ' + res.statusText + ' ' + JSON.stringify(res.body)))
          }
        }
      }, appId, Util.transformMapToArray(policyMap))
    }
  },

  setPolicyStart() {
    return {
      type: ActionTypes.SET_APP_POLICY_START
    }
  },

  setPolicySuccess(data) {
    return {
      type: ActionTypes.SET_APP_POLICY_SUCCESS,
      data
    }
  },

  setPolicyFailed(err) {
    return {
      type: ActionTypes.SET_APP_POLICY_FAILED,
      err
    }
  },

  setCurrentPolicy(policy) {
    return {
      type: ActionTypes.SET_APP_CURRENT_POLICY_SUCCESS,
      policy
    }
  },

  deletePolicy(appId) {
    return function (dispatch) {
      dispatch(PolicyActions.deletePolicyStart())
      Sources.deleteAppPolicy((err, res) => {
        if (err && res == null) {
          dispatch(PolicyActions.deletePolicyFailed(err.toString(), []))
        } else {
          if (res.status == 200) {
            dispatch(PolicyActions.deletePolicySuccess())
          } else if (res.status == 400) {
            dispatch(PolicyActions.deletePolicyFailed(res.body.error))
          } else if (res.status == 401) {
            dispatch(PolicyActions.deletePolicyFailed(res.status + ' ' + res.statusText))
          } else if (res.status == 403) {
            if (!res.body) {
              dispatch(PolicyActions.deletePolicyFailed(res.status + ' ' + res.statusText + ' ' + res.text))
            } else {
              dispatch(PolicyActions.deletePolicyFailed(res.body.error))
            }
          } else {
            dispatch(PolicyActions.deletePolicyFailed(res.status + ' ' + res.statusText + ' ' + JSON.stringify(res.body)))
          }
        }
      }, appId)
    }
  },

  deletePolicyStart() {
    return {
      type: ActionTypes.DELETE_APP_POLICY_START
    }
  },

  deletePolicySuccess() {
    return {
      type: ActionTypes.DELETE_APP_POLICY_SUCCESS,
    }
  },

  deletePolicyFailed(err) {
    return {
      type: ActionTypes.DELETE_APP_POLICY_FAILED,
      err
    }
  },

  resetDeletePolicyError() {
    return {
      type: ActionTypes.RESET_DELETE_APP_POLICY_ERROR,
    }
  },

}

export default PolicyActions
