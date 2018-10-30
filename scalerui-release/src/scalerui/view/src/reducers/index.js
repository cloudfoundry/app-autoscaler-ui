import { combineReducers } from 'redux'
import containerViewData from '../reducers/containerViewReducer'
import serviceViewData from '../reducers/serviceViewReducer'
import appViewData from '../reducers/appViewReducer'
import metricsData from '../reducers/metricsReducer'
import historyData from '../reducers/historyReducer'

export default combineReducers({
  containerViewData,
  serviceViewData,
  appViewData,
  metricsData,
  historyData,
})
