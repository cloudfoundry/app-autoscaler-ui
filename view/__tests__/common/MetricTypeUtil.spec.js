import MetricTypeUtil from '../../src/common/MetricTypeUtil'
import Locale from '../../src/common/Locale'

const localeZhcn = Locale.getLocale('zh-CN')
const localeEnus = Locale.getLocale('en-US')

describe('Common Tools Test -- MetricTypeUtil', function() {

  it('Test getMetricOptionDescription', function () {
    expect(localeZhcn[MetricTypeUtil.getMetricOptionDescription('memoryused')]).toBe('内存');
    expect(localeEnus[MetricTypeUtil.getMetricOptionDescription('memoryused')]).toBe('Memory Used');
    expect(MetricTypeUtil.getMetricOptionDescription('memoryutil')).toBe('metric_type_memoryutil');
    expect(MetricTypeUtil.getMetricOptionDescription('responsetime')).toBe('metric_type_responsetime');
    expect(MetricTypeUtil.getMetricOptionDescription('throughput')).toBe('metric_type_throughput');
    expect(MetricTypeUtil.getMetricOptionDescription('fake')).toBe('');
  });

  it('Test getMetricUnit', function () {
    expect(localeZhcn[MetricTypeUtil.getMetricUnit('memoryused')]).toBe('MB');
    expect(localeEnus[MetricTypeUtil.getMetricUnit('memoryused')]).toBe('MB');
    expect(MetricTypeUtil.getMetricUnit('memoryused')).toBe('metric_unit_mb');
    expect(MetricTypeUtil.getMetricUnit('memoryutil')).toBe('metric_unit_percentage');
    expect(MetricTypeUtil.getMetricUnit('responsetime')).toBe('metric_unit_ms');
    expect(MetricTypeUtil.getMetricUnit('throughput')).toBe('metric_unit_rps');
    expect(MetricTypeUtil.getMetricUnit('fake')).toBe('');
  });

  it('Test getMetricNamesMessageIds', function () {
    expect(MetricTypeUtil.getMetricNamesMessageIds().length).toBe(4);
    expect(MetricTypeUtil.getMetricNamesMessageIds()[0].name).toBe('memoryused');
    expect(MetricTypeUtil.getMetricNamesMessageIds()[1].name).toBe('memoryutil');
    expect(MetricTypeUtil.getMetricNamesMessageIds()[2].name).toBe('responsetime');
    expect(MetricTypeUtil.getMetricNamesMessageIds()[3].name).toBe('throughput');
  });

});



