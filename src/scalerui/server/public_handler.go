package server

import (
	"scalerui/config"
	"scalerui/models"

	"code.cloudfoundry.org/cfhttp/handlers"
	"code.cloudfoundry.org/lager"

	"net/http"
)

type PublicHandler struct {
	config     *config.Config
	logger     lager.Logger
	httpClient *http.Client
}

func NewPublicHandler(logger lager.Logger, config *config.Config, httpClient *http.Client) *PublicHandler {
	return &PublicHandler{
		config:     config,
		logger:     logger.Session("PublicHandler"),
		httpClient: httpClient,
	}
}

func (h *PublicHandler) GetHealthCheck(w http.ResponseWriter, r *http.Request, vars map[string]string) {
	h.logger.Debug("get-health-check")
	publicHealthError := models.PublicHealthError{
		CloudfoundryAutoscaler:          "",
		CloudfoundryAutoscalerTimestamp: "",
	}
	publicHealth := models.PublicHealth{
		Status: true,
		Error:  publicHealthError,
	}
	handlers.WriteJSONResponse(w, http.StatusOK, publicHealth)
}

func (h *PublicHandler) GetInfo(w http.ResponseWriter, r *http.Request, vars map[string]string) {
	h.logger.Debug("get-info")
	publicInfo := models.PublicInfo{
		Version: "1.0",
		Uptime:  "Fri Sep 21 11:02:04 CST 2018",
	}
	handlers.WriteJSONResponse(w, http.StatusOK, publicInfo)
}
