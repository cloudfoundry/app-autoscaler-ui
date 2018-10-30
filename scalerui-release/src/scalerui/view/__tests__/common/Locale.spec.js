import Locale from '../../src/common/Locale'

describe('Common Tools Test -- Local', function() {

  it('Test zh-CN', function () {
    let locale = Locale.getLocale('zh-CN')
    expect(locale.metric_type_memoryused).toBe('内存');
  });

  it('Test en-US', function () {
    let locale = Locale.getLocale('en-US')
    expect(locale.metric_type_memoryused).toBe('Memory Used');
  });

  it('Test default', function () {
    let locale = Locale.getLocale('xx')
    expect(locale.metric_type_memoryused).toBe('Memory Used');
  });

});



