package server

import (
	"scalerui/config"
	"scalerui/models"
	"scalerui/routes"

	"code.cloudfoundry.org/cfhttp/handlers"
	"code.cloudfoundry.org/lager"

	"fmt"
	"net/http"
)

type PolicyHandler struct {
	config     *config.Config
	logger     lager.Logger
	httpClient *http.Client
}

func NewPolicyHandler(logger lager.Logger, config *config.Config, httpClient *http.Client) *PolicyHandler {
	return &PolicyHandler{
		config:     config,
		logger:     logger.Session("PolicyHandler"),
		httpClient: httpClient,
	}
}

func (h *PolicyHandler) GetPolicy(w http.ResponseWriter, r *http.Request, vars map[string]string) {
	appId := vars["appid"]
	h.logger.Debug("get-policy", lager.Data{"appId": appId})

	var err error
	var url string
	path, err := routes.ScalerUiRoutes().Get(routes.GetPolicyRouteName).URLPath("appid", appId)
	if err != nil {
		h.logger.Error("failed-to-get-route", err)
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: "Failed to get route to api server"})
		return
	}
	url = h.config.ApiServer.Url + path.RequestURI()
	h.logger.Debug("get-policy-url", lager.Data{"url": url})
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		h.logger.Error("failed-to-get-policy-from-api-server. request-failed", err, lager.Data{"appId": appId, "err": err})
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to build http request"),
		})
		return
	}
	req.Header = r.Header
	resp, err := h.httpClient.Do(req)
	if err != nil {
		h.logger.Error("failed-to-get-policy-from-api-server. request-failed", err, lager.Data{"appId": appId, "err": err})
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to get policy from api server"),
		})
		return
	}
	defer resp.Body.Close()
	handleResponse(resp, h.logger, w)
}

func (h *PolicyHandler) UpdatePolicy(w http.ResponseWriter, r *http.Request, vars map[string]string) {
	appId := vars["appid"]
	h.logger.Debug("update-policy", lager.Data{"appId": appId})

	var err error
	var url string
	path, err := routes.ScalerUiRoutes().Get(routes.UpdatePolicyRouteName).URLPath("appid", appId)
	if err != nil {
		h.logger.Error("failed-to-get-route", err)
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: "Failed to get route to api server"})
		return
	}
	url = h.config.ApiServer.Url + path.RequestURI()
	h.logger.Debug("upldate-policy-url", lager.Data{"url": url})
	req, err := http.NewRequest(http.MethodPut, url, r.Body)
	if err != nil {
		h.logger.Error("failed-to-update-policy-from-api-server. request-failed", err, lager.Data{"appId": appId, "err": err})
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to build http request"),
		})
		return
	}
	req.Header = r.Header
	resp, err := h.httpClient.Do(req)
	if err != nil {
		h.logger.Error("failed-to-update-policy-from-api-server. request-failed", err, lager.Data{"appId": appId, "err": err})
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to update policy from api server"),
		})
		return
	}
	defer resp.Body.Close()
	handleResponse(resp, h.logger, w)
}
func (h *PolicyHandler) DeletePolicy(w http.ResponseWriter, r *http.Request, vars map[string]string) {
	appId := vars["appid"]
	h.logger.Debug("get-policy", lager.Data{"appId": appId})

	var err error
	var url string
	path, err := routes.ScalerUiRoutes().Get(routes.DeletePolicyRouteName).URLPath("appid", appId)
	if err != nil {
		h.logger.Error("failed-to-get-route", err)
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: "Failed to get route to api server"})
		return
	}
	url = h.config.ApiServer.Url + path.RequestURI()
	h.logger.Debug("delete-policy-url", lager.Data{"url": url})
	req, err := http.NewRequest(http.MethodDelete, url, nil)
	if err != nil {
		h.logger.Error("failed-to-get-policy-from-api-server. request-failed", err, lager.Data{"appId": appId, "err": err})
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to build http request"),
		})
		return
	}
	req.Header = r.Header
	resp, err := h.httpClient.Do(req)
	if err != nil {
		h.logger.Error("failed-to-get-policy-from-api-server. request-failed", err, lager.Data{"appId": appId, "err": err})
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to delete policy from api server"),
		})
		return
	}
	defer resp.Body.Close()
	handleResponse(resp, h.logger, w)
}
