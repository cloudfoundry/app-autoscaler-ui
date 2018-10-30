import ActionTypes from '../constants/ActionTypes'
import Sources from '../sources'
import Constants from '../constants/Constants'

let MetricsActions = {

  setInitialMetricsOptions(metrics) {
    return {
      type: ActionTypes.SET_INITIAL_METRICS_OPTIONS_SUCCESS,
      metrics
    }
  },
  
  setMetricsOptions(options) {
    return {
      type: ActionTypes.SET_METRICS_OPTIONS_SUCCESS,
      options
    }
  },

  getMetrics(appId, metricName, selectedIndex, loading, query) {
    return function (dispatch) {
      if (selectedIndex == Constants.query_metrics_instance_mean) {
        dispatch(MetricsActions.getAppMetricsStart(loading))
        Sources.getAppMetrics((err, res) => {
          if (err && !res) {
            //network error
            dispatch(MetricsActions.getAppMetricsFailed(metricName, err.toString()))
          } else {
            if (res.status == 200) {
              let resources = res.body.resources
              if (resources.length > 0) {
                let basicInfo = MetricsActions.getBasicInfo(metricName, resources)
                let interval = basicInfo.interval
                let unit = basicInfo.unit
                let maxValue = basicInfo.maxValue
                dispatch(MetricsActions.getAppMetricsSuccess(metricName, unit, maxValue, MetricsActions.transform(resources, interval, query['start-time'], query['end-time']), query))
              } else {
                dispatch(MetricsActions.getAppMetricsSuccess(metricName, '', -1, [], query))
              }
            } else if (res.status == 401) {
              //unauthorized
              dispatch(MetricsActions.getAppMetricsFailed(metricName, res.status + ' ' + res.statusText))
            } else if (res.status == 403) {
              //unbind
              if (!res.body) {
                dispatch(MetricsActions.getAppMetricsFailed(metricName, res.status + ' ' + res.statusText + ' ' + res.text))
              } else {
                dispatch(MetricsActions.getAppMetricsFailed(metricName, res.body.error))
              }
            } else {
              //other error
              dispatch(MetricsActions.getAppMetricsFailed(metricName, res.status + ' ' + res.statusText + ' ' + JSON.stringify(res.body)))
            }
          }
        }, appId, metricName, query)
      }
      dispatch(MetricsActions.getInstanceMetricsStart(loading))
      Sources.getInstanceMetrics((err, res) => {
        if (err && !res) {
          //network error
          dispatch(MetricsActions.getInstanceMetricsFailed(metricName, err.toString()))
        } else {
          if (res.status == 200) {
            let resources = res.body.resources
            if (resources.length > 0) {
              let basicInfo = MetricsActions.getBasicInfo(metricName, resources)
              let interval = basicInfo.interval
              let maxIndex = basicInfo.maxIndex
              let unit = basicInfo.unit
              let maxValue = basicInfo.maxValue
              dispatch(MetricsActions.getInstanceMetricsSuccess(metricName, unit, maxIndex, maxValue, MetricsActions.transform(resources, interval, query['start-time'], query['end-time']), query))
            } else {
              dispatch(MetricsActions.getInstanceMetricsSuccess(metricName, '', -1, -1, [], query))
            }
          } else if (res.status == 401) {
            //unauthorized
            dispatch(MetricsActions.getInstanceMetricsFailed(metricName, res.status + ' ' + res.statusText))
          } else if (res.status == 403) {
            //unbind
            if (!res.body) {
              dispatch(MetricsActions.getInstanceMetricsFailed(metricName, res.status + ' ' + res.statusText + ' ' + res.text))
            } else {
              dispatch(MetricsActions.getInstanceMetricsFailed(metricName, res.body.error))
            }
          } else {
            //other error
            dispatch(MetricsActions.getInstanceMetricsFailed(metricName, res.status + ' ' + res.statusText + ' ' + JSON.stringify(res.body)))
          }
        }
      }, appId, metricName, query)
    }
  },

  getAppMetricsStart(loading) {
    return {
      type: ActionTypes.GET_APP_METRICS_START,
      loading
    }
  },

  getAppMetricsSuccess(name, unit, maxValue, data, query) {
    return {
      type: ActionTypes.GET_APP_METRICS_SUCCESS,
      unit,
      data,
      name,
      maxValue,
      query
    }
  },

  getAppMetricsFailed(name, err) {
    return {
      type: ActionTypes.GET_APP_METRICS_FAILED,
      name,
      err
    }
  },

  getInstanceMetricsStart(loading) {
    return {
      type: ActionTypes.GET_INSTANCE_METRICS_START,
      loading
    }
  },

  getInstanceMetricsSuccess(name, unit, maxIndex, maxValue, data, query) {
    return {
      type: ActionTypes.GET_INSTANCE_METRICS_SUCCESS,
      unit,
      data,
      name,
      maxIndex,
      maxValue,
      query
    }
  },

  getInstanceMetricsFailed(name, err) {
    return {
      type: ActionTypes.GET_INSTANCE_METRICS_FAILED,
      name,
      err
    }
  },

  resetMetricsView() {
    return {
      type: ActionTypes.RESET_METRICS_VIEW
    }
  },

  transform(source, interval, startTime, endTime) {
    startTime = startTime / Constants.S2NS
    endTime = endTime / Constants.S2NS
    if (source.length == 0) {
      return []
    }
    let scope = parseInt(interval / 2)
    let target = []
    let targetTimestamp = parseInt(source[0].timestamp / Constants.S2NS)
    let targetIndex = 0

    let insertEmptyNumber = parseInt((targetTimestamp - startTime) / interval)
    let startTimestamp = targetTimestamp - insertEmptyNumber * interval
    for (; targetIndex < insertEmptyNumber; targetIndex++) {
      target[targetIndex] = {
        time: startTimestamp + targetIndex * interval
      }
    }

    let sourceIndex = 0
    while (sourceIndex < source.length) {
      if (!target[targetIndex]) {
        target[targetIndex] = {
          time: targetTimestamp
        }
      }
      let metric = source[sourceIndex]
      let thisIndex = metric.instance_index ? metric.instance_index : 0
      let sourceTimestamp = parseInt(metric.timestamp / Constants.S2NS)
      if (sourceTimestamp < targetTimestamp - scope) {
        sourceIndex++
      } else if (sourceTimestamp > targetTimestamp + scope) {
        target[targetIndex]['mean'] = this.getMean(target[targetIndex])
        targetIndex++
        targetTimestamp += interval
      } else {
        target[targetIndex][thisIndex] = parseInt(metric.value)
        sourceIndex++
      }
    }
    target[targetIndex]['mean'] = this.getMean(target[targetIndex])
    let currentLatestTime = target[targetIndex].time + interval
    while (currentLatestTime < endTime) {
      target.push({
        time: currentLatestTime
      })
      currentLatestTime = currentLatestTime + interval
    }
    return target
  },

  getBasicInfo(metricName, source) {
    let map = {}
    let interval = Constants.metricMap[metricName]['interval']
    let maxCount = 0
    let preTimestampMap = {}
    let maxIndex = -1
    let maxValue = -1
    for (let i = 0; i < source.length; i++) {
      maxValue = parseInt(source[i].value) > maxValue ? parseInt(source[i].value) : maxValue
      let thisTimestamp = parseInt(source[i].timestamp / Constants.S2NS)
      let thisIndex = source[i].instance_index ? source[i].instance_index : 0
      if (preTimestampMap[thisIndex] == undefined) {
        if (thisIndex > maxIndex) {
          maxIndex = thisIndex
        }
        preTimestampMap[thisIndex] = thisTimestamp
      } else {
        let currentInterval = thisTimestamp - preTimestampMap[thisIndex]
        if (map[currentInterval] == undefined) {
          map[currentInterval] = 1
        } else {
          map[currentInterval]++
        }
        if (map[currentInterval] > maxCount) {
          interval = currentInterval
          maxCount = map[currentInterval]
        }
        preTimestampMap[thisIndex] = thisTimestamp
      }
    }
    return {
      interval: interval,
      maxIndex: maxIndex,
      unit: source[0].unit,
      maxValue: maxValue
    }
  },

  getMean(data) {
    let total = 0
    let count = 0
    Object.keys(data).map((item) => {
      if (item != 'time') {
        total += data[item]
        count++
      }
    })
    if (count == 0) {
      return '-'
    } else {
      return parseInt(total / count)
    }
  }

}

export default MetricsActions
