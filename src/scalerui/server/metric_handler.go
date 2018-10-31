package server

import (
	"scalerui/config"
	"scalerui/models"
	"scalerui/routes"

	"code.cloudfoundry.org/cfhttp/handlers"
	"code.cloudfoundry.org/lager"

	"fmt"
	"net/http"
	"strconv"
	"strings"
)

type MetricHandler struct {
	config     *config.Config
	logger     lager.Logger
	httpClient *http.Client
}

func NewMetricHandler(logger lager.Logger, config *config.Config, httpClient *http.Client) *MetricHandler {
	return &MetricHandler{
		config:     config,
		logger:     logger.Session("MetricHandler"),
		httpClient: httpClient,
	}
}

func (h *MetricHandler) GetMetricHistories(w http.ResponseWriter, r *http.Request, vars map[string]string) {
	appId := vars["appid"]
	metricType := vars["metrictype"]
	start := r.URL.Query()["start-time"]
	end := r.URL.Query()["end-time"]
	order := r.URL.Query()["order"]
	page := r.URL.Query()["page"]
	resultsPerPage := r.URL.Query()["results-per-page"]

	h.logger.Debug("get-metric-histories", lager.Data{"appId": appId, "metrictype": metricType, "start": start, "end": end, "page": page, "resultsPerPage": resultsPerPage, "order": order})

	var err error

	if len(start) == 1 {
		_, err = strconv.ParseInt(start[0], 10, 64)
		if err != nil {
			h.logger.Error("get-metric-histories-parse-start-time", err, lager.Data{"start": start})
			handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
				Code:        "Bad-Request",
				Description: "Error parsing start time"})
			return
		}
	} else if len(start) > 1 {
		h.logger.Error("get-metric-histories-get-start-time", err, lager.Data{"start": start})
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "Incorrect start parameter in query string"})
		return
	}

	if len(end) == 1 {
		_, err = strconv.ParseInt(end[0], 10, 64)
		if err != nil {
			h.logger.Error("get-metric-histories-parse-end-time", err, lager.Data{"end": end})
			handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
				Code:        "Bad-Request",
				Description: "Error parsing end time"})
			return
		}
	} else if len(end) > 1 {
		h.logger.Error("get-metric-histories-get-end-time", err, lager.Data{"end": end})
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "Incorrect end parameter in query string"})
		return
	}

	if len(order) == 1 {
		orderStr := strings.ToUpper(order[0])
		if orderStr != models.DESCSTR && orderStr != models.ASCSTR {
			h.logger.Error("get-metric-histories-parse-order", err, lager.Data{"order": order})
			handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
				Code:        "Bad-Request",
				Description: fmt.Sprintf("Incorrect order parameter in query string, the value can only be %s or %s", models.ASCSTR, models.DESCSTR),
			})
			return
		}
	} else if len(order) > 1 {
		h.logger.Error("get-metric-histories-parse-order", err, lager.Data{"order": order})
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "Incorrect order parameter in query string"})
		return
	}
	if len(page) == 1 {
		_, err = strconv.ParseInt(page[0], 10, 64)
		if err != nil {
			h.logger.Error("failed-to-parse-page", err, lager.Data{"page": page})
			handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
				Code:        "Bad-Request",
				Description: "Error parsing page"})
			return
		}
	} else if len(page) > 1 {
		h.logger.Error("failed-to-get-page", err, lager.Data{"page": page})
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "Incorrect page parameter in query string"})
		return
	}

	if len(resultsPerPage) == 1 {
		_, err = strconv.ParseInt(resultsPerPage[0], 10, 64)
		if err != nil {
			h.logger.Error("failed-to-parse-results-per-page", err, lager.Data{"results-per-page": resultsPerPage})
			handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
				Code:        "Bad-Request",
				Description: "Error parsing results-per-page"})
			return
		}
	} else if len(resultsPerPage) > 1 {
		h.logger.Error("failed-to-get-results-per-page", err, lager.Data{"results-per-page": resultsPerPage})
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "Incorrect results-per-page parameter in query string"})
		return
	}
	var url string
	path, err := routes.ScalerUiRoutes().Get(routes.GetMetricHistoriesRouteName).URLPath("appid", appId, "metrictype", metricType)
	if err != nil {
		h.logger.Error("failed-to-get-route", err)
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: "Failed to get route to api server"})
		return
	}
	parameters := path.Query()
	if len(start) == 1 {
		parameters.Add("start-time", start[0])

	}
	if len(end) == 1 {
		parameters.Add("end-time", end[0])

	}
	if len(order) == 1 {
		parameters.Add("order", order[0])

	}
	if len(page) == 1 {
		parameters.Add("page", page[0])

	}
	if len(resultsPerPage) == 1 {
		parameters.Add("results-per-page", resultsPerPage[0])

	}
	url = h.config.ApiServer.Url + path.RequestURI() + "?" + parameters.Encode()
	h.logger.Debug("get-metrics-history-url", lager.Data{"url": url})
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		h.logger.Error("failed-to-get-metrics-from-api-server. request-failed", err, lager.Data{"appId": appId, "err": err})
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to build http request"),
		})
		return
	}
	req.Header = r.Header
	resp, err := h.httpClient.Do(req)
	if err != nil {
		h.logger.Error("failed-to-retrieve-metric-from-api-server. request-failed", err, lager.Data{"appId": appId, "start": start, "end": end, "metricType": metricType, "order": order, "err": err})
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to retrieve metrics from api server"),
		})
		return
	}
	defer resp.Body.Close()
	handleResponse(resp, h.logger, w)
}
