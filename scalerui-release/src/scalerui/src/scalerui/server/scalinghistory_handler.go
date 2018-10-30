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

type ScalingHistoryHandler struct {
	config     *config.Config
	logger     lager.Logger
	httpClient *http.Client
}

func NewScalingHistoryHandler(logger lager.Logger, config *config.Config, httpClient *http.Client) *ScalingHistoryHandler {
	return &ScalingHistoryHandler{
		config:     config,
		logger:     logger.Session("ScalingHistoryHandler"),
		httpClient: httpClient,
	}
}

func (h *ScalingHistoryHandler) GetScalingHistories(w http.ResponseWriter, r *http.Request, vars map[string]string) {
	appId := vars["appid"]
	logger := h.logger.Session("get-scaling-histories", lager.Data{"appId": appId})

	start := r.URL.Query()["start-time"]
	end := r.URL.Query()["end-time"]
	order := r.URL.Query()["order"]
	page := r.URL.Query()["page"]
	resultsPerPage := r.URL.Query()["results-per-page"]
	logger.Debug("handling", lager.Data{"start": start, "end": end})

	var err error

	if len(start) == 1 {
		_, err = strconv.ParseInt(start[0], 10, 64)
		if err != nil {
			logger.Error("failed-to-parse-start-time", err, lager.Data{"start": start})
			handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
				Code:        "Bad-Request",
				Description: "Error parsing start time"})
			return
		}
	} else if len(start) > 1 {
		logger.Error("failed-to-get-start-time", err, lager.Data{"start": start})
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "Incorrect start parameter in query string"})
		return
	}

	if len(end) == 1 {
		_, err = strconv.ParseInt(end[0], 10, 64)
		if err != nil {
			logger.Error("failed-to-parse-end-time", err, lager.Data{"end": end})
			handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
				Code:        "Bad-Request",
				Description: "Error parsing end time"})
			return
		}
	} else if len(end) > 1 {
		logger.Error("failed-to-get-end-time", err, lager.Data{"end": end})
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "Incorrect end parameter in query string"})
		return
	}

	if len(order) == 1 {
		orderStr := strings.ToUpper(order[0])
		if orderStr != models.DESCSTR && orderStr != models.ASCSTR {
			logger.Error("failed-to-get-order", err, lager.Data{"order": order})
			handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
				Code:        "Bad-Request",
				Description: fmt.Sprintf("Incorrect order parameter in query string, the value can only be %s or %s", models.ASCSTR, models.DESCSTR),
			})
			return
		}
	} else if len(order) > 1 {
		logger.Error("failed-to-get-order", err, lager.Data{"order": order})
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "Incorrect order parameter in query string"})
		return
	}

	if len(page) == 1 {
		_, err = strconv.ParseInt(page[0], 10, 64)
		if err != nil {
			logger.Error("failed-to-parse-page", err, lager.Data{"page": page})
			handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
				Code:        "Bad-Request",
				Description: "Error parsing page"})
			return
		}
	} else if len(page) > 1 {
		logger.Error("failed-to-get-page", err, lager.Data{"page": page})
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "Incorrect page parameter in query string"})
		return
	}

	if len(resultsPerPage) == 1 {
		_, err = strconv.ParseInt(resultsPerPage[0], 10, 64)
		if err != nil {
			logger.Error("failed-to-parse-results-per-page", err, lager.Data{"results-per-page": resultsPerPage})
			handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
				Code:        "Bad-Request",
				Description: "Error parsing results-per-page"})
			return
		}
	} else if len(resultsPerPage) > 1 {
		logger.Error("failed-to-get-results-per-page", err, lager.Data{"results-per-page": resultsPerPage})
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "Incorrect results-per-page parameter in query string"})
		return
	}
	var url string
	path, err := routes.ScalerUiRoutes().Get(routes.GetScalingHistoriesRouteName).URLPath("appid", appId)
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
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		h.logger.Error("failed-to-get-scalinghistories-from-api-server. request-failed", err, lager.Data{"appId": appId, "err": err})
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to build http request"),
		})
		return
	}
	req.Header = r.Header
	resp, err := h.httpClient.Do(req)
	if err != nil {
		h.logger.Error("failed-to-retrieve-scaling-histories-from-api-server. request failed", err, lager.Data{"appId": appId, "start": start, "end": end, "order": order, "page": page, "result-per-page": resultsPerPage, "err": err})
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: "Failed to retrieve scaling histories from api server"})
		return
	}
	defer resp.Body.Close()
	handleResponse(resp, h.logger, w)
}
