export default {

    serviceId: 'fake_service_id',
    appId: 'fake_app_id',
    metricName: 'fake_metric_name',
    query: {
        'start-time': 0,
        'end-time': 1000000,
        'page': 1,
        'results-per-page': 10,
        'order': 'desc'
    },
    responseResult: {
        fake: 'fake',
        resources: []
    },
    errorMsg: 'fake_error',
    errorBody: ['fake_error'],
    getOkCodes: [200],
    getErrorCodes: [400, 401, 403, 404, 500],
    setOkCodes: [200, 201],
    setErrorCodes: [400, 401, 403, 500],
    deleteOkCodes: [200],
    deleteErrorCodes: [400, 401, 403, 500],

    responseBody403: {
        error: 'The application is not bound to Auto-Scaling service'
    },

    fullPolicy: {
        'instance_min_count': 1,
        'instance_max_count': 10,
        'scaling_rules': [{
            'metric_type': 'memoryused',
            'stat_window_secs': 300,
            'breach_duration_secs': 600,
            'threshold': 30,
            'operator': '<',
            'cool_down_secs': 300,
            'adjustment': '-1'
        }, {
            'metric_type': 'memoryused',
            'stat_window_secs': 300,
            'breach_duration_secs': 600,
            'threshold': 90,
            'operator': '>=',
            'cool_down_secs': 300,
            'adjustment': '+2'
        }, {
            'metric_type': 'memoryutil',
            'stat_window_secs': 300,
            'breach_duration_secs': 600,
            'threshold': 30,
            'operator': '<',
            'cool_down_secs': 300,
            'adjustment': '-1'
        }, {
            'metric_type': 'memoryutil',
            'stat_window_secs': 300,
            'breach_duration_secs': 600,
            'threshold': 90,
            'operator': '>=',
            'cool_down_secs': 300,
            'adjustment': '+2'
        },
        {
            'metric_type': 'throughput',
            'stat_window_secs': 300,
            'breach_duration_secs': 600,
            'threshold': 20,
            'operator': '<',
            'cool_down_secs': 300,
            'adjustment': '-3'
        }, {
            'metric_type': 'responsetime',
            'stat_window_secs': 300,
            'breach_duration_secs': 600,
            'threshold': 50,
            'operator': '>=',
            'cool_down_secs': 300,
            'adjustment': '+4'
        },
        {
            'metric_type': 'responsetime',
            'stat_window_secs': 300,
            'breach_duration_secs': 600,
            'threshold': 40,
            'operator': '<',
            'cool_down_secs': 300,
            'adjustment': '-5'
        }, {
            'metric_type': 'throughput',
            'stat_window_secs': 300,
            'breach_duration_secs': 600,
            'threshold': 120,
            'operator': '>=',
            'cool_down_secs': 300,
            'adjustment': '+6'
        }],
        'schedules': {
            'timezone': 'Asia/Shanghai',
            'recurring_schedule': [{
                'start_time': '00:00',
                'end_time': '10:00',
                'days_of_month': [
                    1,
                    2,
                    3
                ],
                'instance_min_count': 1,
                'instance_max_count': 10,
                'initial_min_instance_count': 5
            },
            {
                'start_date': '2099-06-27',
                'end_date': '2099-07-23',
                'start_time': '11:00',
                'end_time': '19:30',
                'days_of_month': [
                    5,
                    15,
                    25
                ],
                'instance_min_count': 3,
                'instance_max_count': 10,
                'initial_min_instance_count': 5
            }],
            'specific_date': [{
                'start_date_time': '2099-06-02T10:00',
                'end_date_time': '2099-06-15T13:59',
                'instance_min_count': 1,
                'instance_max_count': 4,
                'initial_min_instance_count': 2
            }, {
                'start_date_time': '2099-01-04T20:00',
                'end_date_time': '2099-02-19T23:15',
                'instance_min_count': 2,
                'instance_max_count': 5,
                'initial_min_instance_count': 3
            }]
        }
    },
    defaultPolicy: {
		'instance_min_count': 1,
		'instance_max_count': 5,
		'scaling_rules': [
			{
				'metric_type': 'memoryused',
				'breach_duration_secs': 121,
				'threshold': 80,
				'operator': '>=',
				'cool_down_secs': 121,
				'adjustment': '+1'
			},
			{
				'metric_type': 'memoryused',
				'breach_duration_secs': 121,
				'threshold': 30,
				'operator': '<',
				'cool_down_secs': 121,
				'adjustment': '-1'
			}
		]
	},

    fakeBoundApps: {
        applications: [
            {
                'app_guid': '4db90d35-ee90-4c91-a54a-cb79dc65d686',
                'app_name': 'node1',
                'state': 'STARTED',
                'app_type': 'nodejs',
                'instances': '1',
                'memory_quota': '256',
            },
            {
                'app_guid': 'a32bcf42-fc3a-4bfc-8e85-b782ad26bb6a',
                'app_name': 'node2',
                'app_type': 'nodejs',
                'state': 'STARTED',
                'instances': '1',
                'memory_quota': '256',
            },
            {
                'app_guid': '75370617-ec81-41d1-9e63-e37830fae4bc',
                'app_name': 'node3',
                'app_type': 'nodejs',
                'state': 'STARTED',
                'instances': '1',
                'memory_quota': '256',
            },
            {
                'app_guid': '4fe68d86-19f9-4a1e-afd0-d42117ba3df1',
                'app_name': 'node4',
                'app_type': 'java',
                'state': 'STOPPED',
                'instances': '0',
                'memory_quota': '256',
            },
        ]
    }

}
