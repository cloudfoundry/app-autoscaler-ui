import DefaultConfig from '../config.default'

let config = window.g

if (config == undefined) {
	config = DefaultConfig
}

export default {

	PolicyNotExist: 'noPolicyDefied',

	MetricsMinRangeMinutes: 1,
	MetricsMaxRangeMinutes: 121,
	MetricsRefreshSeconds: 30,

	metricsPerPage: 10000000,
	S2NS: 1000000000, // seconds to nanoseconds
	minGap: 2,

	MomentFormateDate: 'YYYY-MM-DD',
	MomentFormateDateTime: 'YYYY-MM-DD HH:mm:ss',
	MomentFormateDateTimeT: 'YYYY-MM-DDTHH:mm',
	MomentFormateTime: 'HH:mm',
	MomentFormateTimeA: 'hh:mm A',
	MomentFormateTimeS: 'HH:mm:ss',

	MetricTypes: ['memoryused', 'memoryutil', 'responsetime', 'throughput'],
	ScaleTypes: ['upper', 'lower'],
	UpperOperators: ['>', '>='],
	LowerOperators: ['<', '<='],
	ScalingType: ['dynamic', 'schedule'],
	ScalingStatus: ['succeeded', 'failed', 'ignored'],

	policyDefaultSetting: config.policy,

	metricMap: {
		memoryused: {
			unit: 'metric_unit_mb',
			unit_internal: 'MB',
			type: 'value',
			type_string: 'metric_type_memoryused',
			interval: 15,
		},
		memoryutil: {
			unit: 'metric_unit_percentage',
			unit_internal: 'percent',
			type: 'percentage',
			type_string: 'metric_type_memoryutil',
			interval: 15,
		},
		responsetime: {
			unit: 'metric_unit_ms',
			unit_internal: 'ms',
			type: 'value',
			type_string: 'metric_type_responsetime',
			interval: 30,
		},
		throughput: {
			unit: 'metric_unit_rps',
			unit_internal: 'RPS',
			type: 'value',
			type_string: 'metric_type_throughput',
			interval: 30,
		}
	},

	restUrl_base: config.restUrl_base,
	restUrl_serviceBoundApps: '/services/SERVICE_ID/apps',
	restUrl_appPolicy: '/apps/APP_ID/policy',
	restUrl_appMetrics: '/apps/APP_ID/aggregated_metric_histories/METRIC_NAME',
	restUrl_instanceMetrics: '/apps/APP_ID/metric_histories/METRIC_NAME',
	restUrl_appHistory: '/apps/APP_ID/scaling_histories',

	//constants for metrics query
	query_metrics_range: [
		{ id: 'metrics_page_select_time_range_30', key: 30 },
		{ id: 'metrics_page_select_time_range_60', key: 60 },
		{ id: 'metrics_page_select_time_range_120', key: 120 },
		{ id: 'metrics_page_select_time_range_custom', key: 'custom' },
	],
	query_metrics_range_custom: 'custom',
	query_metrics_instance_mean: 'mean',

	// constants for scaling history query
	queryMode_undefined: 'undefined',
	queryMode_pastWeek: 'pastWeek',
	queryMode_pastMonth: 'pastMonth',
	queryMode_customRange: 'customRange',
	menuName_pastWeek: 'PastWeek',
	menuName_pastMonth: 'PastMonth',
	menuName_customRange: 'CustomRange',

	defaultPolicy: {
		'instance_min_count': 1,
		'instance_max_count': 5,
		'scaling_rules': [
			{
				'metric_type': 'memoryused',
				'breach_duration_secs': config.policy.scaling_rules.breach_duration_secs_default + 1,
				'threshold': 80,
				'operator': '>=',
				'cool_down_secs': config.policy.scaling_rules.cool_down_secs_default + 1,
				'adjustment': '+1'
			},
			{
				'metric_type': 'memoryused',
				'breach_duration_secs': config.policy.scaling_rules.breach_duration_secs_default + 1,
				'threshold': 30,
				'operator': '<',
				'cool_down_secs': config.policy.scaling_rules.cool_down_secs_default + 1,
				'adjustment': '-1'
			}
		]
	},

	templatePolicy: {
		'instance_min_count': 1,
		'instance_max_count': 5,
		'scaling_rules_map': {
			'memoryused': {
				'lower': {
					'metric_type': 'memoryused',
					'breach_duration_secs': config.policy.scaling_rules.breach_duration_secs_default,
					'threshold': 30,
					'operator': '<',
					'cool_down_secs': config.policy.scaling_rules.cool_down_secs_default,
					'adjustment': '-1',
					'expand': false
				}
			}
		},
		'schedules': {
			'timezone': 'Asia/Shanghai',
			'recurring_schedule': [{
				'start_time': '10:00',
				'end_time': '18:00',
				'days_of_week': [
					1, 2, 3
				],
				'instance_min_count': 1,
				'instance_max_count': 10,
				'initial_min_instance_count': 5
			}],
			'specific_date': [{
				'start_date_time': '2099-06-02T10:00',
				'end_date_time': '2099-06-15T18:00',
				'instance_min_count': 1,
				'instance_max_count': 10,
				'initial_min_instance_count': 5
			}]
		}
	},

}
