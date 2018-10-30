import fs from 'fs'
import Util from '../../src/common/Util'

const policyFile = '__tests__/assets/policy/policy.json'
const policyMapFile = '__tests__/assets/policy/policy.map.json'
const policyInvalidFile = '__tests__/assets/policy/policy.invalid.json'

describe('Common Tools Test -- Util', function () {

  it('Test getDayTime array', function () {
    expect(Util.getDayTime(14).length).toBe(24 * 4);
    expect(Util.getDayTime(14)[0]).toBe('00:00');
    expect(Util.getDayTime(14)[1]).toBe('00:15');
    expect(Util.getDayTime(59).length).toBe(24);
    expect(Util.getDayTime(59)[0]).toBe('00:00');
    expect(Util.getDayTime(59)[1]).toBe('01:00');
  });

  it('Test getDayTimeMap array', function () {
    expect(Util.getDayTimeMap(14).length).toBe(24 * 4);
    expect(Util.getDayTimeMap(14)[0]['id']).toBe('00:00');
    expect(Util.getDayTimeMap(14)[0]['text']).toBe('00:00');
    expect(Util.getDayTimeMap(14)[1]['id']).toBe('00:15');
    expect(Util.getDayTimeMap(14)[1]['text']).toBe('00:15');
    expect(Util.getDayTimeMap(59).length).toBe(24);
    expect(Util.getDayTimeMap(59)[1]['id']).toBe('01:00');
    expect(Util.getDayTimeMap(59)[1]['text']).toBe('01:00');
  });

  it('Test getDayTimeItem array', function () {
    expect(Util.getDayTimeItem(14).length).toBe(24 * 4);
    expect(Util.getDayTimeItem(14)[0]['id']).toBe('00:00');
    expect(Util.getDayTimeItem(14)[0]['text']).toBe('00:00');
    expect(Util.getDayTimeItem(14)[52]['id']).toBe('13:00');
    expect(Util.getDayTimeItem(14)[52]['text']).toBe('13:00');
  });

  it('Test policy transformation', function () {
    let arrayPolicy = JSON.parse(fs.readFileSync(policyFile))
    let mapPolicy = JSON.parse(fs.readFileSync(policyMapFile))
    let mapPolicyFromArray = Util.transformArrayToMap(arrayPolicy)
    let arrayPolicyFromMap = Util.transformMapToArray(mapPolicy)
    expect(Util.isEqual(mapPolicyFromArray, mapPolicy)).toBe(true)
    expect(Util.isEqual(arrayPolicyFromMap, Util.transformMapToArray(Util.transformArrayToMap(arrayPolicy)))).toBe(true)
    delete arrayPolicy['scaling_rules']
    expect(Util.isPolicyMapEqual(arrayPolicy, Util.transformArrayToMap(arrayPolicy))).toBe(true)
    delete mapPolicy['scaling_rules_map']
    delete mapPolicy['scaling_rules_form']
    expect(Util.isEqual(mapPolicy, Util.transformMapToArray(mapPolicy))).toBe(true)
  });

  it('Test policy check -- valid', function () {
    let arrayPolicy = JSON.parse(fs.readFileSync(policyFile))
    let mapPolicyFromArray = Util.transformArrayToMap(arrayPolicy)
    expect(Util.checkPolicy(mapPolicyFromArray).length).toBe(0)

    arrayPolicy['schedules']['recurring_schedule'] = []
    mapPolicyFromArray = Util.transformArrayToMap(arrayPolicy)
    expect(Util.checkPolicy(mapPolicyFromArray).length).toBe(0)

    delete arrayPolicy['schedules']['recurring_schedule']
    mapPolicyFromArray = Util.transformArrayToMap(arrayPolicy)
    expect(Util.checkPolicy(mapPolicyFromArray).length).toBe(0)

    arrayPolicy['schedules']['specific_date'] = []
    mapPolicyFromArray = Util.transformArrayToMap(arrayPolicy)
    expect(Util.checkPolicy(mapPolicyFromArray).length).toBe(0)

    delete arrayPolicy['schedules']['specific_date']
    mapPolicyFromArray = Util.transformArrayToMap(arrayPolicy)
    expect(Util.checkPolicy(mapPolicyFromArray).length).toBe(0)
  });

  it('Test policy check -- invalid', function () {
    let arrayPolicy = JSON.parse(fs.readFileSync(policyFile))
    delete arrayPolicy['scaling_rules']
    delete arrayPolicy['schedules']
    let mapPolicyFromArray = Util.transformArrayToMap(arrayPolicy)
    let expectedError = [ [ { id: 'alert_invalid_policy_trigger_schedule_empty' }, {} ] ]
    expect(Util.isEqual(Util.checkPolicy(mapPolicyFromArray), expectedError)).toBe(true)
  });

  it('Test policy check -- invalid', function () {
    let arrayPolicy = JSON.parse(fs.readFileSync(policyInvalidFile))
    let mapPolicyFromArray = Util.transformArrayToMap(arrayPolicy)
    let errorArray = Util.checkPolicy(mapPolicyFromArray)
    let errorCount = {}
    errorArray.map((item) => {
      let msg = item[0].id
      if (errorCount[msg]) {
        errorCount[msg] = errorCount[msg] + 1
      } else {
        errorCount[msg] = 1
      }
    })
    let errorCountExpect = {
      alert_invalid_policy_minimum_range: 3,
      alert_invalid_policy_maximum_range: 3,
      alert_invalid_policy_trigger_lower_threshold_range: 2,
      alert_invalid_policy_trigger_lower_step_range: 2,
      alert_invalid_policy_trigger_upper_threshold_range: 2,
      alert_invalid_policy_trigger_upper_step_range: 2,
      alert_invalid_policy_trigger_threshold_100: 2,
      alert_invalid_policy_trigger_cooldown_range: 2,
      alert_invalid_policy_trigger_breachduration_range: 1,
      alert_invalid_policy_schedule_end_time_before_start_time: 1,
      alert_invalid_policy_schedule_start_date_before_now: 1,
      alert_invalid_policy_schedule_end_date_before_now: 1,
      alert_invalid_policy_schedule_repeat_on: 1,
      alert_invalid_policy_schedule_end_date_before_start_date: 1,
      alert_invalid_policy_initial_minimum_range: 6,
      alert_invalid_policy_schedule_recurring_conflict: 1,
      alert_invalid_policy_schedule_start_datetime_before_now: 1,
      alert_invalid_policy_schedule_end_datetime_before_now: 1,
      alert_invalid_policy_schedule_end_datetime_before_start_datetime: 1,
      alert_invalid_policy_schedule_specific_conflict: 1
    }
    expect(Util.isEqual(errorCount, errorCountExpect)).toBe(true)
  });

  it('Test numberInputOnclick', function () {
    expect(Util.numberInputOnclickValue(100, 'up')).toBe(101)
    expect(Util.numberInputOnclickValue(-100, 'up')).toBe(-99)
    expect(Util.numberInputOnclickValue('', 'up')).toBe(1)
    expect(Util.numberInputOnclickValue(100, 'down')).toBe(99)
    expect(Util.numberInputOnclickValue('', 'down')).toBe(-1)
    expect(Util.numberInputOnclickValue(0, 'down')).toBe(-1)
    expect(Util.numberInputOnclickValue(100, '')).toBe(100)
  })

  it('Test numberInputUpdate', function () {
    let item = { threshold: 100, adjustment: '-11' }
    Util.numberInputUpdate('10', item, 'threshold')
    expect(item['threshold']).toBe(10)
    Util.numberInputUpdate('', item, 'threshold')
    expect(item['threshold']).toBe(undefined)
    Util.numberInputUpdate('+10', item, 'adjustment', true)
    expect(item['adjustment']).toBe('+10')
  })

  it('Test isNotEqual', function () {
    let item1 = { threshold: 100, adjustment: '-11' }
    let item2 = { threshold: [], adjustment: '-11' }
    let item3 = { threshold: 100, adjustment: '-11', breach_duration_secs:100 }
    expect(Util.isEqual(item1, item2)).toBe(false)
    expect(Util.isEqual(item1, item3)).toBe(false)
    
  })

});




