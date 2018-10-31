package server

import (
	"scalerui/config"
	// "scalerui/models"

	// "code.cloudfoundry.org/cfhttp/handlers"
	"code.cloudfoundry.org/lager"
	"github.com/gorilla/csrf"

	"html/template"
	"net/http"
	"strconv"
	"time"
)

type IndexHandler struct {
	config     *config.Config
	logger     lager.Logger
	httpClient *http.Client
}

func NewIndexHandler(logger lager.Logger, config *config.Config, httpClient *http.Client) *IndexHandler {
	return &IndexHandler{
		config:     config,
		logger:     logger.Session("IndexHandler"),
		httpClient: httpClient,
	}
}

func (h *IndexHandler) HandleIndex(w http.ResponseWriter, r *http.Request, vars map[string]string) {
	serviceId := vars["serviceid"]
	// appIds := r.URL.Query()["app_id"]
	// if len(appIds) == 0 {
	// 	h.logger.Info("failed-to-get-appid", lager.Data{"url": r.URL})
	// 	handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
	// 		Code:        "Bad-Request",
	// 		Description: "Failed to get appid from request parameters"})
	// 	return
	// }
	// appId := appIds[0]

	data := map[string]interface{}{"ServiceId": serviceId, "Version": strconv.FormatInt(time.Now().UnixNano(), 10), csrf.TemplateTag: csrf.TemplateField(r)}
	indexTemplate, _ := template.ParseFiles(h.config.Server.ViewPath + "/index.html")
	indexTemplate.Execute(w, data)
}
