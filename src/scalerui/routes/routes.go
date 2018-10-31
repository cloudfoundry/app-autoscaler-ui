package routes

import (
	"github.com/gorilla/mux"

	"net/http"
)

const (
	AggregatedMetricHistoriesPath         = "/v1/apps/{appid}/aggregated_metric_histories/{metrictype}"
	GetAggregatedMetricHistoriesRouteName = "GetAggregatedMetricHistories"

	MetricHistoriesPath         = "/v1/apps/{appid}/metric_histories/{metrictype}"
	GetMetricHistoriesRouteName = "GetMetricHistories"

	ScalingHistoriesPath         = "/v1/apps/{appid}/scaling_histories"
	GetScalingHistoriesRouteName = "GetScalingHistories"

	PolicyPath            = "/v1/apps/{appid}/policy"
	GetPolicyRouteName    = "GetPolicy"
	UpdatePolicyRouteName = "UpdatePolicy"
	DeletePolicyRouteName = "DeletePolicy"

	SSOCheckPath      = "/SSOCheck"
	SSOCheckRouteName = "SSOCheckGet"

	ServiceIndexPath         = "/manage/{serviceid}"
	ServiceIndexGetRouteName = "ServiceIndex"

	AppIndexPath         = "/apps/{appid}"
	AppIndexGetRouteName = "AppIndex"

	ServiceApplicationsPath      = "/v1/services/{serviceid}/apps"
	ServiceApplicationsRouteName = "GetAppsByService"

	PublicInfoPath         = "/v1/public/info"
	GetPublicInfoRouteName = "GetInfo"

	PublicHealthCheckPath         = "/v1/public/health_check"
	GetPublicHealthCheckRouteName = "GetHealthCheck"
)

type ScalerUiRoute struct {
	scalerUiRoutes *mux.Router
}

var ScalerUiRouteInstance *ScalerUiRoute = newRouters()

func newRouters() *ScalerUiRoute {
	instance := &ScalerUiRoute{
		scalerUiRoutes: mux.NewRouter(),
	}

	instance.scalerUiRoutes.Path(AggregatedMetricHistoriesPath).Methods(http.MethodGet).Name(GetAggregatedMetricHistoriesRouteName)
	instance.scalerUiRoutes.Path(MetricHistoriesPath).Methods(http.MethodGet).Name(GetMetricHistoriesRouteName)
	instance.scalerUiRoutes.Path(ScalingHistoriesPath).Methods(http.MethodGet).Name(GetScalingHistoriesRouteName)

	instance.scalerUiRoutes.Path(PolicyPath).Methods(http.MethodGet).Name(GetPolicyRouteName)
	instance.scalerUiRoutes.Path(PolicyPath).Methods(http.MethodPut).Name(UpdatePolicyRouteName)
	instance.scalerUiRoutes.Path(PolicyPath).Methods(http.MethodDelete).Name(DeletePolicyRouteName)

	instance.scalerUiRoutes.Path(SSOCheckPath).Methods(http.MethodGet, http.MethodPost, http.MethodPut).Name(SSOCheckRouteName)

	instance.scalerUiRoutes.Path(ServiceIndexPath).Methods(http.MethodGet).Name(ServiceIndexGetRouteName)
	instance.scalerUiRoutes.Path(AppIndexPath).Methods(http.MethodGet).Name(AppIndexGetRouteName)

	instance.scalerUiRoutes.Path(ServiceApplicationsPath).Methods(http.MethodGet).Name(ServiceApplicationsRouteName)

	instance.scalerUiRoutes.Path(PublicInfoPath).Methods(http.MethodGet).Name(GetPublicInfoRouteName)
	instance.scalerUiRoutes.Path(PublicHealthCheckPath).Methods(http.MethodGet).Name(GetPublicHealthCheckRouteName)

	return instance

}
func ScalerUiRoutes() *mux.Router {
	return ScalerUiRouteInstance.scalerUiRoutes
}
