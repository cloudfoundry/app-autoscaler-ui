window.g = {
    restUrl_base: '/v1',
    policy: {
        scaling_rules: {
            stat_window_secs_default: 120,
            stat_window_secs_min: 60,
            stat_window_secs_max: 3600,

            breach_duration_secs_default: 120,
            breach_duration_secs_min: 60,
            breach_duration_secs_max: 3600,

            cool_down_secs_default: 120,
            cool_down_secs_min: 60,
            cool_down_secs_max: 3600,
        }
    }
}
