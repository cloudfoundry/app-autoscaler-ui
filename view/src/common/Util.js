import Constants from '../constants/Constants'
import intersect from 'intersect'
import Moment from 'moment-timezone'
import Immutable from 'immutable'
import Local from './Locale'
import MetricTypeUtil from './MetricTypeUtil'
import {
    extendMoment
} from 'moment-range'

const moment = extendMoment(Moment)

let Util = {

    getDayTime(interval) {
        let array = []
        for (let i = 0; i < 24 * 60; i++) {
            array[array.length] = moment(i * 60 * 1000).utc().format(Constants.MomentFormateTime)
            i = i + interval
        }
        return array
    },

    getDayTimeMap(interval) {
        let array = []
        for (let i = 0; i < 24 * 60; i++) {
            let time = moment(i * 60 * 1000).utc().format(Constants.MomentFormateTime)
            array[array.length] = {
                id: time,
                text: time
            }
            i = i + interval
        }
        return array
    },

    getDayTimeItem(interval) {
        let array = []
        for (let i = 0; i < 24 * 60; i++) {
            let time = moment(i * 60 * 1000).utc().format(Constants.MomentFormateTime)
            array[array.length] = {
                id: time,
                text: time
            }
            i = i + interval
        }
        return array
    },

    checkPolicy(policy) {
        let alertMessages = []

        if (this.numberWithFractionOrExceedRange(policy.instance_min_count, 1, policy.instance_max_count - 1, true)) {
            alertMessages.push([{
                id: 'alert_invalid_policy_minimum_range'
            }, {}])
        }
        if (this.numberWithFractionOrExceedRange(policy.instance_max_count, policy.instance_min_count + 1, Number.MAX_VALUE, true)) {
            alertMessages.push([{
                id: 'alert_invalid_policy_maximum_range'
            }, {}])
        }

        if (Object.keys(policy.scaling_rules_map).length == 0 && policy.schedules.recurring_schedule.length == 0 && policy.schedules.specific_date.length == 0) {
            alertMessages.push([{
                id: 'alert_invalid_policy_trigger_schedule_empty'
            }, {}])
        }

        policy.scaling_rules_form.map((rule) => {
            let metricType = rule.metric_type
            let scaleType = this.getScaleType(rule)
            if (metricType == 'memoryutil') {
                if (this.numberWithFractionOrExceedRange(rule.threshold, 1, 100, true)) {
                    alertMessages.push([{
                        id: 'alert_invalid_policy_trigger_threshold_100'
                    }, {
                        metric_type: Local.getLocale(this.getDefaultLocal())[MetricTypeUtil.getMetricOptionDescription(metricType)]
                    }])
                }
            }
            if (this.numberWithFractionOrExceedRange(rule.threshold, this.getThresthodMin(policy.scaling_rules_form, metricType, scaleType), this.getThresthodMax(policy.scaling_rules_form, metricType, scaleType), true)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_trigger_' + scaleType + '_threshold_range'
                }, {
                    metric_type: Local.getLocale(this.getDefaultLocal())[MetricTypeUtil.getMetricOptionDescription(metricType)]
                }])
            }
            if (this.numberWithFractionOrExceedRange(rule.adjustment, 1, policy.instance_max_count - 1, true, scaleType, 'adjustment')) {
                let percentagePart = ''
                if (rule.adjustment && rule.adjustment.indexOf('%') >= 0) {
                    percentagePart = '_percentage'
                }
                alertMessages.push([{
                    id: 'alert_invalid_policy_trigger_' + scaleType + '_step' + percentagePart + '_range'
                }, {
                    metric_type: Local.getLocale(this.getDefaultLocal())[MetricTypeUtil.getMetricOptionDescription(metricType)]
                }])
            }
            if (this.numberWithFractionOrExceedRange(rule.breach_duration_secs, Constants.policyDefaultSetting.scaling_rules.breach_duration_secs_min, Constants.policyDefaultSetting.scaling_rules.breach_duration_secs_max, false)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_trigger_breachduration_range'
                }, {
                    metric_type: Local.getLocale(this.getDefaultLocal())[MetricTypeUtil.getMetricOptionDescription(metricType)],
                    value_min: Constants.policyDefaultSetting.scaling_rules.cool_down_secs_min,
                    value_max: Constants.policyDefaultSetting.scaling_rules.breach_duration_secs_max
                }])
            }
            if (this.numberWithFractionOrExceedRange(rule.cool_down_secs, Constants.policyDefaultSetting.scaling_rules.cool_down_secs_min, Constants.policyDefaultSetting.scaling_rules.cool_down_secs_max, false)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_trigger_cooldown_range'
                }, {
                    metric_type: Local.getLocale(this.getDefaultLocal())[MetricTypeUtil.getMetricOptionDescription(metricType)],
                    value_min: Constants.policyDefaultSetting.scaling_rules.cool_down_secs_min,
                    value_max: Constants.policyDefaultSetting.scaling_rules.cool_down_secs_max
                }])
            }
        })

        policy.schedules.recurring_schedule.map((item) => {
            if (this.recurringSchedulesInvalidRepeatOn(item)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_schedule_repeat_on'
                }, {}])
            }
            if (this.timeIsSameOrAfter(item.start_time, item.end_time)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_schedule_end_time_before_start_time'
                }, {}])
            }
            if (item.start_date && this.dateIsAfter(moment().format(Constants.MomentFormateDate), item.start_date)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_schedule_start_date_before_now'
                }, {}])
            }
            if (item.end_date && this.dateIsAfter(moment().format(Constants.MomentFormateDate), item.end_date)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_schedule_end_date_before_now'
                }, {}])
            }
            if (item.start_date && item.end_date && this.dateIsAfter(item.start_date, item.end_date)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_schedule_end_date_before_start_date'
                }, {}])
            }
            if (item.initial_min_instance_count != undefined && this.numberWithFractionOrExceedRange(item.initial_min_instance_count, item.instance_min_count, item.instance_max_count, false)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_initial_minimum_range'
                }, {}])
            }
            if (this.numberWithFractionOrExceedRange(item.instance_min_count, 1, item.instance_max_count - 1, true)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_minimum_range'
                }, {}])
            }
            if (this.numberWithFractionOrExceedRange(item.instance_max_count, item.instance_min_count + 1, Number.MAX_VALUE, true)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_maximum_range'
                }, {}])
            }
        })
        if (Object.keys(this.recurringSchedulesOverlapping(policy.schedules.recurring_schedule, 'days_of_week')).length > 0 || Object.keys(this.recurringSchedulesOverlapping(policy.schedules.recurring_schedule, 'days_of_month')).length > 0) {
            alertMessages.push([{
                id: 'alert_invalid_policy_schedule_recurring_conflict'
            }, {}])
        }

        policy.schedules.specific_date.map((item) => {
            if (item.start_date_time && this.dateTimeIsSameOrAfter(moment().tz(policy.schedules.timezone).format(Constants.MomentFormateDateTimeT), item.start_date_time, policy.schedules.timezone)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_schedule_start_datetime_before_now'
                }, {}])
            }
            if (item.end_date_time && this.dateTimeIsSameOrAfter(moment().tz(policy.schedules.timezone).format(Constants.MomentFormateDateTimeT), item.end_date_time, policy.schedules.timezone)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_schedule_end_datetime_before_now'
                }, {}])
            }
            if (this.dateTimeIsSameOrAfter(item.start_date_time, item.end_date_time, policy.schedules.timezone)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_schedule_end_datetime_before_start_datetime'
                }, {}])
            }
            if (item.initial_min_instance_count != undefined && this.numberWithFractionOrExceedRange(item.initial_min_instance_count, item.instance_min_count, item.instance_max_count, false)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_initial_minimum_range'
                }, {}])
            }
            if (this.numberWithFractionOrExceedRange(item.instance_min_count, 1, item.instance_max_count - 1, true)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_minimum_range'
                }, {}])
            }
            if (this.numberWithFractionOrExceedRange(item.instance_max_count, item.instance_min_count + 1, Number.MAX_VALUE, true)) {
                alertMessages.push([{
                    id: 'alert_invalid_policy_maximum_range'
                }, {}])
            }
        })
        if (Object.keys(this.specificDateRangeOverlapping(policy.schedules.specific_date)).length > 0) {
            alertMessages.push([{
                id: 'alert_invalid_policy_schedule_specific_conflict'
            }, {}])
        }

        return alertMessages
    },

    numberWithFractionOrExceedRange(value, min, max, required, scaleType, fieldName) {
        if (fieldName == 'adjustment' && value && value.indexOf('%') >= 0) {
            value = value.replace('%', '')
            if (scaleType == 'lower') {
                max = 100
            } else {
                max = Number.MAX_VALUE
            }
        }
        if (isNaN(value) && required) {
            return true
        }
        if (fieldName == 'adjustment' && scaleType == 'lower') {
            value = - Number(value)
        } else {
            value = Number(value)
        }
        return value.toString().indexOf('.') > -1 || value > max || value < min
    },

    timeIsSameOrAfter(startTime, endTime) {
        return moment(startTime, Constants.MomentFormateTime).isSameOrAfter(moment(endTime, Constants.MomentFormateTime));
    },

    dateIsAfter(startDate, endDate) {
        return moment(startDate, Constants.MomentFormateDate).isAfter(moment(endDate, Constants.MomentFormateDate));
    },

    dateTimeIsSameOrAfter(startDateTime, endDateTime, timezone) {
        return moment.tz(startDateTime, timezone).isSameOrAfter(moment.tz(endDateTime, timezone));
    },

    recurringSchedulesInvalidRepeatOn(inputRecurringSchedules) {
        let weekdayCount = inputRecurringSchedules.hasOwnProperty('days_of_week') ? inputRecurringSchedules['days_of_week'].length : 0
        let monthdayCount = inputRecurringSchedules.hasOwnProperty('days_of_month') ? inputRecurringSchedules['days_of_month'].length : 0
        return (weekdayCount > 0 && monthdayCount > 0) || (weekdayCount == 0 && monthdayCount == 0)
    },

    recurringSchedulesOverlapping(inputRecurringSchedules, property) {
        let errorpairs = {}
        for (let j = 0; inputRecurringSchedules && j < inputRecurringSchedules.length - 1; j++) {
            for (let i = j + 1; i < inputRecurringSchedules.length; i++) {
                if (inputRecurringSchedules[i].hasOwnProperty(property) && inputRecurringSchedules[j].hasOwnProperty(property)) {
                    if (inputRecurringSchedules[i].hasOwnProperty('start_date') && inputRecurringSchedules[i].hasOwnProperty('end_date') && inputRecurringSchedules[j].hasOwnProperty('start_date') && inputRecurringSchedules[j].hasOwnProperty('end_date')) {
                        if (!this.dateOverlaps(inputRecurringSchedules[i]['start_date'], inputRecurringSchedules[i]['end_date'], inputRecurringSchedules[j]['start_date'], inputRecurringSchedules[j]['end_date'])) {
                            continue
                        }
                    }
                    if (this.timeOverlaps(inputRecurringSchedules[i]['start_time'], inputRecurringSchedules[i]['end_time'], inputRecurringSchedules[j]['start_time'], inputRecurringSchedules[j]['end_time'])) {
                        let intersects = intersect(inputRecurringSchedules[i][property], inputRecurringSchedules[j][property])
                        intersects.map((item) => {
                            if (!errorpairs.hasOwnProperty(i)) {
                                errorpairs[i] = {}
                            }
                            errorpairs[i][item] = true
                            if (!errorpairs.hasOwnProperty(j)) {
                                errorpairs[j] = {}
                            }
                            errorpairs[j][item] = true
                        })
                    }
                }
            }
        }
        return errorpairs
    },

    specificDateRangeOverlapping(inputSpecificDates) {
        let errorpairs = {}
        var dateRangeList = []
        if (inputSpecificDates.length > 0) {
            for (let i = 0; inputSpecificDates && i < inputSpecificDates.length; i++) {
                let start = moment(inputSpecificDates[i].start_date_time, Constants.MomentFormateDateTimeT)
                let end = moment(inputSpecificDates[i].end_date_time, Constants.MomentFormateDateTimeT)
                let range = moment.range(start, end)
                dateRangeList[i] = range;
            }
            for (let j = 0; j < dateRangeList.length; j++) {
                for (let i = j + 1; i < dateRangeList.length; i++) {
                    if (dateRangeList[j].overlaps(dateRangeList[i])) {
                        errorpairs[i] = true
                        errorpairs[j] = true
                    }
                }
            }
        }
        return errorpairs
    },

    timeOverlaps(start_time_i, end_time_i, start_time_j, end_time_j) {
        let rangei = moment.range(moment('1970-01-01T' + start_time_i, Constants.MomentFormateDateTimeT), moment('1970-01-01T' + end_time_i, Constants.MomentFormateDateTimeT))
        let rangej = moment.range(moment('1970-01-01T' + start_time_j, Constants.MomentFormateDateTimeT), moment('1970-01-01T' + end_time_j, Constants.MomentFormateDateTimeT))
        return rangei.overlaps(rangej)
    },

    dateOverlaps(start_date_i, end_date_i, start_date_j, end_date_j) {
        let rangei = moment.range(moment(start_date_i + 'T00:00', Constants.MomentFormateDateTimeT), moment(end_date_i + 'T23:59', Constants.MomentFormateDateTimeT))
        let rangej = moment.range(moment(start_date_j + 'T00:00', Constants.MomentFormateDateTimeT), moment(end_date_j + 'T23:59', Constants.MomentFormateDateTimeT))
        return rangei.overlaps(rangej)
    },

    getThresthodMin(policyTriggers, metricType, scaleType) {
        let thresholdMin = 1
        if (scaleType == 'upper') {
            policyTriggers.map((trigger) => {
                if (trigger.metric_type == metricType && Constants.LowerOperators.indexOf(trigger.operator) >= 0) {
                    thresholdMin = trigger.threshold + 1 > thresholdMin ? trigger.threshold + 1 : thresholdMin
                }
            })
        }
        return thresholdMin
    },

    getThresthodMax(policyTriggers, metricType, scaleType) {
        let thresholdMax = Number.MAX_VALUE
        if (scaleType == 'lower') {
            policyTriggers.map((trigger) => {
                if (trigger.metric_type == metricType && Constants.UpperOperators.indexOf(trigger.operator) >= 0) {
                    thresholdMax = trigger.threshold - 1 < thresholdMax ? trigger.threshold - 1 : thresholdMax
                }
            })
        }
        return thresholdMax
    },

    isEqual(a, b) {
        if (typeof (a) != typeof (b)) {
            return false
        } else {
            if (typeof (a) == 'object') {
                if (Object.keys(a).length != Object.keys(b).length) {
                    return false
                }
                let equal = true
                Object.keys(a).map((key) => {
                    equal = equal && this.isEqual(a[key], b[key])
                })
                return equal
            } else {
                return JSON.stringify(a) == JSON.stringify(b)
            }
        }
    },

    isPolicyMapEqual(a, b) {
        return this.isEqual(this.transformMapToArray(a), this.transformMapToArray(b))
    },

    isPolicyArrayEqual(a, b) {
        return this.isEqual(this.transformArrayToMap(a), this.transformArrayToMap(b))
    },

    //suppose zero is invalid for all of the number inputs
    numberInputOnclickValue(preValue, type) {
        let value = parseInt(preValue == undefined || preValue == '' ? 0 : preValue)
        if (type == 'up') {
            return  value + 1
        } else if (type == 'down') {
            return value - 1
        } else {
            return value
        }
    },

    numberInputUpdate(value, item, fieldName, saveString) {
        if (value != undefined && value !== '' && value != '%') {
            if (saveString) item[fieldName] = value
            else item[fieldName] = Number(value)
        } else {
            delete item[fieldName]
        }
    },

    transformArrayToMap(policy, timezone) {
        if (timezone == undefined || timezone == "") {
            timezone = moment.tz.guess()
          }
        let newPolicy = Immutable.fromJS(policy).toJS()
        let scaling_rules = newPolicy.scaling_rules
        let scaling_rules_map = {}
        let scaling_rules_form = []
        if (scaling_rules) {
            Constants.MetricTypes.map((metricType) => {
                let tuple = {}
                scaling_rules.map((trigger) => {
                    trigger['expand'] = false
                    if (!trigger.breach_duration_secs) {
                        trigger.breach_duration_secs = Constants.policyDefaultSetting.scaling_rules.breach_duration_secs_default
                    }
                    if (!trigger.cool_down_secs) {
                        trigger.cool_down_secs = Constants.policyDefaultSetting.scaling_rules.cool_down_secs_default
                    }
                    if (trigger.metric_type == metricType && Constants.LowerOperators.indexOf(trigger.operator) >= 0) {
                        if (!tuple.lower) tuple.lower = []
                        this.pushAndSortTrigger(tuple.lower, trigger)
                    } else if (trigger.metric_type == metricType && Constants.UpperOperators.indexOf(trigger.operator) >= 0) {
                        if (!tuple.upper) tuple.upper = []
                        this.pushAndSortTrigger(tuple.upper, trigger)
                    }
                })
                if (Object.keys(tuple).length > 0) scaling_rules_map[metricType] = tuple
            })
        }
        newPolicy.scaling_rules_map = scaling_rules_map
        Object.keys(scaling_rules_map).map((metricName) => {
            Constants.ScaleTypes.map((triggerType) => {
                if (scaling_rules_map[metricName][triggerType]) {
                    scaling_rules_map[metricName][triggerType].map((trigger) => {
                        scaling_rules_form.push(trigger)
                    })
                }
            })
        })
        newPolicy.scaling_rules_form = scaling_rules_form
        delete newPolicy['scaling_rules']
        if (!newPolicy.schedules) {
            newPolicy.schedules = {}
            newPolicy.schedules.timezone = timezone
        }
        if (!newPolicy.schedules.recurring_schedule) {
            newPolicy.schedules.recurring_schedule = []
        }
        if (!newPolicy.schedules.specific_date) {
            newPolicy.schedules.specific_date = []
        }
        return newPolicy
    },

    transformMapToArray(policy) {
        let newPolicy = Immutable.fromJS(policy).toJS()
        let scaling_rules_form = newPolicy.scaling_rules_form
        if (scaling_rules_form) {
            let scaling_rules = []
            scaling_rules_form.map((trigger) => {
                delete trigger['expand']
                if (trigger.breach_duration_secs == Constants.policyDefaultSetting.scaling_rules.breach_duration_secs_default) {
                    delete trigger['breach_duration_secs']
                }
                if (trigger.cool_down_secs == Constants.policyDefaultSetting.scaling_rules.cool_down_secs_default) {
                    delete trigger['cool_down_secs']
                }
                scaling_rules.push(trigger)
            })
            if (scaling_rules.length > 0) {
                newPolicy.scaling_rules = scaling_rules
            }
        }
        delete newPolicy['scaling_rules_form']
        delete newPolicy['scaling_rules_map']
        if (newPolicy.schedules) {
            if (newPolicy.schedules.recurring_schedule && newPolicy.schedules.recurring_schedule.length == 0) {
                delete newPolicy.schedules['recurring_schedule']
            }
            if (newPolicy.schedules.specific_date && newPolicy.schedules.specific_date.length == 0) {
                delete newPolicy.schedules['specific_date']
            }
            if (!newPolicy.schedules.recurring_schedule && !newPolicy.schedules.specific_date) {
                delete newPolicy['schedules']
            }
        }
        return newPolicy
    },

    pushAndSortTrigger(triggerArray, newTrigger) {
        for (let i = 0; i < triggerArray.length; i++) {
            if (newTrigger.threshold > triggerArray[i].threshold) {
                triggerArray.splice(i, 0, newTrigger)
                return
            }
        }
        triggerArray.push(newTrigger)
    },

    matchDate(dateString) {
        let reg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/
        let regExp = new RegExp(reg)
        return regExp.test(dateString)

    },

    getDefaultLocal() {
        return navigator.language
    },

    getDefaultLocalConcise() {
        return navigator.language.split('-')[0]
    },

    getScaleType(trigger) {
        if (Constants.LowerOperators.indexOf(trigger.operator) >= 0) {
            return 'lower'
        } else {
            return 'upper'
        }
    }

}

export default Util