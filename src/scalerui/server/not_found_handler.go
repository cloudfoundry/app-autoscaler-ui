package server

import (
	"net/http"

	"code.cloudfoundry.org/cfhttp/handlers"
	"code.cloudfoundry.org/lager"

	"scalerui/models"
)

type NotFoundHandler struct {
	logger lager.Logger
}

func NewNotFoundHandler(logger lager.Logger) *NotFoundHandler {
	return &NotFoundHandler{
		logger: logger.Session("NotFoundHandler"),
	}
}

func (h *NotFoundHandler) HandleNotFound(w http.ResponseWriter, r *http.Request, vars map[string]string) {
	url := r.URL
	h.logger.Debug("handler-not-found-for-url", lager.Data{"url": url})
	handlers.WriteJSONResponse(w, http.StatusNotFound, models.ErrorResponse{
		Code:        "Not-Found",
		Description: "No-handler-for-url"})
}
