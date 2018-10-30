package server_test

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

type ApiServerAggregatedMetricsResponse struct {
	TotalResults int                   `json:"total_results"`
	TotalPages   int                   `json:"total_pages"`
	Page         int                   `json:"page"`
	Resources    []AppAggregatedMetric `json:"resources"`
}

type ApiServerMetricsResponse struct {
	TotalResults int                 `json:"total_results"`
	TotalPages   int                 `json:"total_pages"`
	Page         int                 `json:"page"`
	Resources    []AppInstanceMetric `json:"resources"`
}

type ApiServerScalingHistoryResponse struct {
	TotalResults int                 `json:"total_results"`
	TotalPages   int                 `json:"total_pages"`
	Page         int                 `json:"page"`
	Resources    []AppScalingHistory `json:"resources"`
}

type AppAggregatedMetric struct {
	AppId         string `json:"app_id"`
	InstanceIndex uint32 `json:"instance_index"`
	CollectedAt   int64  `json:"collected_at"`
	Name          string `json:"name"`
	Unit          string `json:"unit"`
	Value         string `json:"value"`
	Timestamp     int64  `json:"timestamp"`
}

type AppInstanceMetric struct {
	AppId         string `json:"app_id"`
	InstanceIndex uint32 `json:"instance_index"`
	CollectedAt   int64  `json:"collected_at"`
	Name          string `json:"name"`
	Unit          string `json:"unit"`
	Value         string `json:"value"`
	Timestamp     int64  `json:"timestamp"`
}

type ScalingType int
type ScalingStatus int

const (
	ScalingTypeDynamic ScalingType = iota
	ScalingTypeSchedule
)

const (
	ScalingStatusSucceeded ScalingStatus = iota
	ScalingStatusFailed
	ScalingStatusIgnored
)

type AppScalingHistory struct {
	AppId        string        `json:"app_id"`
	Timestamp    int64         `json:"timestamp"`
	ScalingType  ScalingType   `json:"scaling_type"`
	Status       ScalingStatus `json:"status"`
	OldInstances int           `json:"old_instances"`
	NewInstances int           `json:"new_instances"`
	Reason       string        `json:"reason"`
	Message      string        `json:"message"`
	Error        string        `json:"error"`
}

func TestServer(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Server Suite")
}
