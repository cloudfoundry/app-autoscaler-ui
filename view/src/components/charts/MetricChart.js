import React, { Component } from 'react'
import ReactEcharts from 'echarts-for-react'
import { connect } from 'react-redux'
import Constants from '../../constants/Constants'
import MetricsActions from '../../actions/MetricsActions'
import MetricTypeUtil from '../../common/MetricTypeUtil'
import { injectIntl, intlShape } from 'react-intl'
import Moment from 'moment'
import { extendMoment } from 'moment-range'
import LocalNotification from '../local/LocalNotification'

const moment = extendMoment(Moment)

class MetricChart extends Component {
  constructor(props) {
    super(props)
    let intl = this.props.intl
    this.state = {
      currentStartTime: this.props.fromTime,
      currentEndTime: this.props.toTime,
      areaChartOption: {
        title: {
          left: 'center',
        },
        tooltip: {
          trigger: 'axis'
        },
        toolbox: {
          show: true,
          right: 20,
          feature: {
            dataView: {
              title: intl.formatMessage({ id: 'metrics_page_area_chart_raw_data' }),
              readOnly: false,
              lang: [intl.formatMessage({ id: 'metrics_page_area_chart_raw_data' }), intl.formatMessage({ id: 'metrics_page_area_chart_raw_data_close' }), intl.formatMessage({ id: 'metrics_page_area_chart_raw_data_update' })]
            },
            saveAsImage: {
              title: intl.formatMessage({ id: 'metrics_page_area_chart_raw_save' }),
              type: 'png',
              lang: [intl.formatMessage({ id: 'metrics_page_area_chart_raw_save_desc' })]
            }
          }
        },
        grid: {
          top: 60,
          left: 40,
          right: 200,
          bottom: 60
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: true,
            data: [],
            axisLabel: {
              rotate: 45
            },
          }
        ],
        yAxis: [
          {
            type: 'value',
            scale: true,
            min: 0,
            splitLine: {
              show: true,
              lineStyle: {
                opacity: 0.3
              }
            },
          }
        ],
        visualMap: {
          show: false,
          pieces: []
        },
        series: [
          {
            name: 'Memory',
            type: 'bar',
            barGap: 0,
            itemStyle: {
              normal: {
                barBorderRadius: 4,
              }
            },
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
              return idx * 10
            },
            animationDelayUpdate: function (idx) {
              return idx * 10
            },
            data: [],
            areaStyle: {},
            markLine: {
              silent: true,
              lineStyle: {
                type: 'dotted',
                width: 1.5
              },
            },
          }
        ]
      },
      gaugeChartOption: {
        title: {
          left: 'center',
        },
        series: [
          {
            type: 'gauge',
            data: [],
            startAngle: 170,
            endAngle: 10,
            radius: '80%',
            axisLine: {
              lineStyle: {
                color: [],
                opacity: 0.6
              },
              width: 50
            },
            center: ['50%', '65%'],
            splitLine: {
              lineStyle: {
                width: 1,
              }
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true,
              distance: -53,
              fontSize: 11
            }
          }
        ]
      }
    }

    this.updateMetrics(this.props.fromTime, this.props.toTime, true)
  }

  setUpperColor(array) {
    //from FF0000 to FFFF00
    let max = parseInt('FF', 16)
    let min = parseInt('00', 16)
    let scope = max - min
    if (array && array.length > 0) {
      let interval = parseInt(scope / array.length)
      for (let i = 0; i < array.length; i++) {
        let color10 = 0 + i * interval
        if (color10 > max) color10 = max
        let color16 = color10.toString(16)
        if (color16.length == 1) color16 = '0' + color16
        array[i].color = '#ff' + color16 + '00'
      }
    }
  }

  setLowerColor(array) {
    //from 3366ff to 33FFff
    let max = parseInt('CC', 16)
    let min = parseInt('44', 16)
    let scope = max - min
    if (array && array.length > 0) {
      let interval = parseInt(scope / array.length)
      for (let i = 0; i < array.length; i++) {
        let color10 = max - i * interval
        if (color10 < min) color10 = min
        let color16 = color10.toString(16)
        if (color16.length == 1) color16 = '0' + color16
        array[i].color = '#33' + color16 + 'ff'
      }
    }
  }

  componentDidMount() {
    if (this.timeTicket) {
      clearInterval(this.timeTicket)
    }
    if (this.props.refresh) {
      this.timeTicket = setInterval(() => {
        this.refreshTask()
      }, Constants.MetricsRefreshSeconds * 1000)
    }
  }

  refreshTask() {
    let rangeFromTo = moment.range(this.props.fromTime, this.props.toTime).duration()
    let currentEndTime = moment()
    let currentStartTime = moment().subtract(rangeFromTo)
    this.updateMetrics(currentStartTime, currentEndTime, false)
  }

  componentWillUnmount() {
    if (this.timeTicket) {
      clearInterval(this.timeTicket)
    }
  }

  shouldComponentUpdate(newProps) {
    if (newProps.refresh != this.props.refresh) {
      if (newProps.refresh) {
        this.timeTicket = setInterval(() => {
          this.refreshTask()
        }, Constants.MetricsRefreshSeconds * 1000)
      } else {
        if (this.timeTicket) {
          clearInterval(this.timeTicket)
        }
      }
    }
    let oldSelection = this.props.metricsData.get('selected_options').toJS()
    let newSelection = newProps.metricsData.get('selected_options').toJS()
    if (oldSelection.rangeSubmit != newSelection.rangeSubmit || newSelection.submitted) {
      let newSetStartTime = newProps.fromTime
      let newSetEndTime = newProps.toTime
      this.updateMetrics(newSetStartTime, newSetEndTime, false)
      newSelection.submitted = false
      this.props.dispatch(MetricsActions.setMetricsOptions(newSelection))
    }
    return true
  }

  updateMetrics(newSetStartTime, newSetEndTime, loading) {
    this.props.dispatch(MetricsActions.getMetrics(this.props.containerViewData.get('app_id'), this.props.metricName, this.props.selectedIndex, loading, {
      'start-time': newSetStartTime * 1000000,
      'end-time': newSetEndTime * 1000000,
      'page': 1,
      'results-per-page': Constants.metricsPerPage,
      'order': 'asc'
    }))
    if (!loading) {
      this.state.currentStartTime = newSetStartTime
      this.state.currentEndTime = newSetEndTime
      this.setState(this.state)
    }
  }

  render() {
    let intl = this.props.intl
    let metricName = this.props.metricName
    let timezone = this.props.timezone
    if (timezone == undefined || timezone == "") {
      timezone = moment.tz.guess()
    }

    let upperThresholdCount = 0
    let lowerThresholdCount = 0
    let maxThreshold = 0
    let metricPolicy = null

    if (this.props.appViewData.get('app_policy_data').get('scaling_rules_map') != null && this.props.appViewData.get('app_policy_data').get('scaling_rules_map').get(metricName) != null) {
      metricPolicy = this.props.appViewData.get('app_policy_data').get('scaling_rules_map').get(metricName).toJS()
      if (metricPolicy.upper && metricPolicy.upper.length > 0) {
        upperThresholdCount = metricPolicy.upper.length
        maxThreshold = metricPolicy.upper[0].threshold
        this.setUpperColor(metricPolicy.upper)
      }
      if (metricPolicy.lower && metricPolicy.lower.length > 0) {
        lowerThresholdCount = metricPolicy.lower.length
        maxThreshold = metricPolicy.lower[0].threshold > maxThreshold ? metricPolicy.lower[0].threshold : maxThreshold
        this.setLowerColor(metricPolicy.lower)
      }
    }

    let selectedIndex = this.props.selectedIndex
    let metrics_data = {}
    if (selectedIndex == Constants.query_metrics_instance_mean) {
      metrics_data = this.props.metricsData.get('app_metrics_data').toJS()
    } else {
      metrics_data = this.props.metricsData.get('instance_metrics_data').toJS()
    }

    if (selectedIndex == Constants.query_metrics_instance_mean && !metricPolicy) {
      return (
        <LocalNotification
          titleId={[
            { id: 'metrics_page_inapplicable_warning_title' },
            { metricName: intl.formatMessage({ id: MetricTypeUtil.getMetricOptionDescription(metricName) }) }
          ]}
          subtitleId='metrics_page_inapplicable_warning_subtitle'
          kind='warning'
        />
      )
    }

    if (this.props.metricsData.get('metrics_error_msg').get(metricName)) {
      return (
        <LocalNotification
          titleId={[
            { id: 'metrics_page_load_failed' },
            { metricName: intl.formatMessage({ id: MetricTypeUtil.getMetricOptionDescription(metricName) }) }
          ]}
          subtitleId={this.props.metricsData.get('metrics_error_msg').get(metricName)}
          kind='error'
        />
      )
    }

    if (!metrics_data[metricName]) return null

    let unit = metrics_data[metricName]['unit']
    let data = metrics_data[metricName]['data']
    let maxValue = metrics_data[metricName]['max']

    let chartMax = (() => {
      let thresholdmax = maxThreshold > 0 ? parseInt(maxThreshold * (upperThresholdCount + lowerThresholdCount + 1) / (upperThresholdCount + lowerThresholdCount)) : 0
      thresholdmax = maxValue > thresholdmax ? maxValue : thresholdmax
      thresholdmax = thresholdmax > 10 ? thresholdmax : 10
      for (let i = 10; i < Number.MAX_VALUE && i < thresholdmax; i = i * 10) {
        if (thresholdmax / i >= 1 && thresholdmax / i < 10) {
          if (thresholdmax > 100) {
            thresholdmax = (Math.ceil(thresholdmax / i * 10)) * i / 10
          } else {
            thresholdmax = (Math.ceil(thresholdmax / i)) * i
          }
          break
        }
      }
      return thresholdmax
    })()

    if (metricName == 'memoryutil') {
      chartMax = 100
    }

    let gaugeChartOption = this.state.gaugeChartOption
    gaugeChartOption.title.text = intl.formatMessage({ id: MetricTypeUtil.getMetricOptionDescription(metricName) })
    let latest = undefined
    for (let i = 0; i < 3 && data.length - 1 - i >= 0; i++) {
      latest = data[data.length - 1 - i][selectedIndex]
      if (!isNaN(latest)) break
    }
    let gaugeUnit = isNaN(latest) ? '' : unit
    gaugeChartOption.series[0].data = [latest]
    gaugeChartOption.series[0].detail = { formatter: '{value} ' + gaugeUnit }
    gaugeChartOption.series[0].axisLine.lineStyle.color = []
    for (let i = lowerThresholdCount - 1; i >= 0; i--) {
      gaugeChartOption.series[0].axisLine.lineStyle.color.push([metricPolicy.lower[i].threshold / chartMax, metricPolicy.lower[i].color])
    }
    gaugeChartOption.series[0].axisLine.lineStyle.color.push([upperThresholdCount > 0 ? metricPolicy.upper[upperThresholdCount - 1].threshold / chartMax : chartMax / chartMax, '#5aa700'])
    for (let i = upperThresholdCount - 1; i >= 0; i--) {
      gaugeChartOption.series[0].axisLine.lineStyle.color.push([i <= 0 ? 1 : metricPolicy.upper[i - 1].threshold / chartMax, metricPolicy.upper[i].color])
    }
    gaugeChartOption.series[0].max = chartMax

    let areaChartOption = this.state.areaChartOption
    areaChartOption.title.text = intl.formatMessage({ id: MetricTypeUtil.getMetricOptionDescription(metricName) })
    areaChartOption.yAxis[0].name = unit
    areaChartOption.yAxis[0].max = chartMax
    areaChartOption.title.subtext = intl.formatMessage(
      { id: 'metrics_page_area_chart_subtitle' },
      {
        startTime: this.state.currentStartTime.format(Constants.MomentFormateDateTime),
        endTime: this.state.currentEndTime.format(Constants.MomentFormateDateTime)
      }
    )
    areaChartOption.series[0].name = intl.formatMessage({ id: MetricTypeUtil.getMetricOptionDescription(metricName) })
    areaChartOption.series[0].data = data.map((item) => {
      return item[selectedIndex]
    })
    areaChartOption.xAxis[0].data = data.map((item) => {
      return moment.tz(item['time'] * 1000, timezone).format(Constants.MomentFormateTimeS)
    })
    areaChartOption.visualMap.pieces = []
    areaChartOption.series[0].markLine.data = []

    if (lowerThresholdCount > 0) {
      for (let i = 0; metricPolicy.lower && i < metricPolicy.lower.length; i++) {
        let item = metricPolicy.lower[i]
        areaChartOption.series[0].markLine.data.push({
          yAxis: item.threshold,
          lineStyle: {
            color: item.color
          },
          label: {
            formatter: intl.formatMessage({
              id: 'metrics_page_area_chart_threshold_des'
            }, {
                adjustment: item.adjustment,
                metricName: intl.formatMessage({ id: MetricTypeUtil.getMetricOptionDescription(metricName) }),
                operator: item.operator,
                threshold: item.threshold
              })
          }
        })
        areaChartOption.visualMap.pieces.push({
          color: item.color,
          colorAlpha: '60%',
          gt: i + 1 >= metricPolicy.lower.length ? 0 : metricPolicy.lower[i + 1].threshold,
          lte: item.threshold
        })
      }
    }
    areaChartOption.visualMap.pieces.push({
      color: '#5aa700',
      colorAlpha: '60%',
      gt: lowerThresholdCount > 0 ? metricPolicy.lower[0].threshold : 0,
      lte: upperThresholdCount > 0 ? metricPolicy.upper[upperThresholdCount - 1].threshold : chartMax
    })
    if (upperThresholdCount > 0) {
      for (let i = 0; metricPolicy.upper && i < metricPolicy.upper.length; i++) {
        let item = metricPolicy.upper[i]
        areaChartOption.series[0].markLine.data.push({
          yAxis: item.threshold,
          lineStyle: {
            color: item.color
          },
          label: {
            formatter: intl.formatMessage({
              id: 'metrics_page_area_chart_threshold_des'
            }, {
                adjustment: item.adjustment,
                metricName: intl.formatMessage({ id: MetricTypeUtil.getMetricOptionDescription(metricName) }),
                operator: item.operator,
                threshold: item.threshold
              })
          }
        })
        areaChartOption.visualMap.pieces.push({
          color: item.color,
          colorAlpha: '60%',
          gt: item.threshold,
          lte: i > 0 ? metricPolicy.upper[i - 1].threshold : chartMax
        })
      }
    }

    return (
      <div>
        <div className='bx--row'>
          <div className='bx--col-xs-12 bx--col-md-4'>
            <ReactEcharts
              ref='echarts_react'
              option={gaugeChartOption} />
          </div>
          <div className='bx--col-xs-12 bx--col-md-7'>
            <ReactEcharts
              ref='echarts_react'
              option={areaChartOption}
              style={{ height: 300 }} />
          </div>
          <div className='bx--col-xs-12 bx--col-md-1'>
          </div>
        </div>
      </div>
    )
  }
}

MetricChart.propTypes = {
  intl: intlShape.isRequired
}

export default injectIntl(
  connect(
    state => ({
      metricsData: state.metricsData,
      appViewData: state.appViewData,
      containerViewData: state.containerViewData
    })
  )(MetricChart))
