import Constants from '../constants/Constants'

let MetricTypeUtil = {

    getMetricOptionDescription(metric) {
        if (metric in Constants.metricMap) {
            return Constants.metricMap[metric]['type_string']
        }
        else
            return ''
    },

    getMetricUnit(metric) {
        if (metric in Constants.metricMap) {
            return Constants.metricMap[metric]['unit']
        }
        else
            return ''
    },

    getMetricNamesMessageIds() {
        let metricTypes = Object.keys(Constants.metricMap)
        let pairs = metricTypes.map((item) => {
            return {
                name: item,
                value: item,
                messageId: Constants.metricMap[item]['type_string']
            }
        })
        return pairs
    }

}

export default MetricTypeUtil
