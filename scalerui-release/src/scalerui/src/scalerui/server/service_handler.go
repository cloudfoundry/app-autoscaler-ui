package server

import (
	"scalerui/config"
	"scalerui/models"

	"code.cloudfoundry.org/cfhttp/handlers"
	"code.cloudfoundry.org/lager"

	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

type ServiceHandler struct {
	config     *config.Config
	logger     lager.Logger
	httpClient *http.Client
}

func NewServiceHandler(logger lager.Logger, config *config.Config, httpClient *http.Client) *ServiceHandler {
	return &ServiceHandler{
		config:     config,
		logger:     logger.Session("ServiceHandler"),
		httpClient: httpClient,
	}
}

func (h *ServiceHandler) GetApplications(w http.ResponseWriter, r *http.Request, vars map[string]string) {
	serviceId := vars["serviceid"]

	h.logger.Debug("get-apps-by-service", lager.Data{"serviceId": serviceId})

	var serviceBindingUrl string
	serviceBindingUrl = h.config.Cf.Api + "/v2/service_instances/" + serviceId + "/service_bindings"
	h.logger.Debug("get-service-binding-url", lager.Data{"url": serviceBindingUrl})
	req, err := http.NewRequest(http.MethodGet, serviceBindingUrl, nil)
	if err != nil {
		h.logger.Error("failed-to-get-service-bindings-from-cc. request-failed", err, lager.Data{"serviceId": serviceId, "err": err})
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to build http request"),
		})
		return
	}
	req.Header = r.Header
	req.Header.Del("Referer")
	resp, err := h.httpClient.Do(req)
	if err != nil {
		h.logger.Error("failed-to-retrieve-metric-from-cc. request-failed", err, lager.Data{"serviceId": serviceId, "err": err})
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to retrieve servicebindings from cc"),
		})
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		//do sth here
		handleResponse(resp, h.logger, w)
	}
	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		h.logger.Error("failed-to-read-server-response", err)
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to get service bindings from cc"),
		})
		return
	}
	var bindings models.ServiceBinding
	err = json.Unmarshal(bodyBytes, &bindings)
	h.logger.Debug("binding-info", lager.Data{"serviceId": serviceId, "binding": bindings, "status": resp.StatusCode, "header": req.Header, "body": string(bodyBytes)})
	var applications []models.Application = []models.Application{}
	for _, binding := range bindings.Resources {
		var appInfoUrl string
		appInfoUrl = h.config.Cf.Api + binding.Entity.AppUrl
		h.logger.Debug("get-app--info-url", lager.Data{"appInfoUrl": appInfoUrl})
		req, err := http.NewRequest(http.MethodGet, appInfoUrl, nil)
		if err != nil {
			h.logger.Error("failed-to-get-app-info-from-cc. request-failed", err, lager.Data{"url": appInfoUrl, "err": err})
			handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
				Code:        "Internal-Server-Error",
				Description: fmt.Sprintf("Failed to build http request"),
			})
			return
		}
		req.Header = r.Header
		req.Header.Del("Referer")
		resp, err := h.httpClient.Do(req)
		if err != nil {
			h.logger.Error("failed-to-retrieve-app-info-from-cc. request-failed", err, lager.Data{"url": appInfoUrl, "err": err})
			handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
				Code:        "Internal-Server-Error",
				Description: fmt.Sprintf("Failed to get app info from cc"),
			})
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			//do sth here
			handleResponse(resp, h.logger, w)
		}
		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			h.logger.Error("failed-to-read-server-response", err)
			handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
				Code:        "Internal-Server-Error",
				Description: fmt.Sprintf("Failed to get app info from cc"),
			})
			return
		}
		var appInfo models.CCApplicationInfo
		err = json.Unmarshal(bodyBytes, &appInfo)
		if err != nil {
			h.logger.Error("failed-to-unmarshal-CCApplicationInfo", err)
			handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
				Code:        "Internal-Server-Error",
				Description: fmt.Sprintf("Failed to get app info from cc"),
			})
			return
		}
		application := models.Application{
			AppGuid:     binding.Entity.AppGuid,
			AppName:     appInfo.Entity.Name,
			Instances:   appInfo.Entity.Instances,
			State:       appInfo.Entity.State,
			MemoryQuota: appInfo.Entity.Memory,
		}
		applications = append(applications, application)
	}

	handlers.WriteJSONResponse(w, http.StatusOK, models.ApplicationResponse{Applications: applications})
}
