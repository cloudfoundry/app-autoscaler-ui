package auth

import (
	"scalerui/config"
	"scalerui/models"
	"scalerui/session"

	"code.cloudfoundry.org/cfhttp/handlers"
	"code.cloudfoundry.org/lager"

	"encoding/base64"
	"encoding/json"
	"net/http"
)

type SSOCallbackHandler struct {
	config     *config.Config
	logger     lager.Logger
	httpClient *http.Client
	sm         session.SessionManager
	uaaHelper  *UAAHelper
}

func NewSSOCallbackHandler(logger lager.Logger, config *config.Config, httpClient *http.Client, sm session.SessionManager, uaaHelper *UAAHelper) *SSOCallbackHandler {
	return &SSOCallbackHandler{
		config:     config,
		logger:     logger.Session("SSOCallbackHandler"),
		httpClient: httpClient,
		sm:         sm,
		uaaHelper:  uaaHelper,
	}
}

func (h *SSOCallbackHandler) SSOCallback(w http.ResponseWriter, r *http.Request, vars map[string]string) {

	code := r.URL.Query()["code"]
	stateString := r.URL.Query()["state"]
	h.logger.Debug("oauth-code-and-state", lager.Data{"code": code, "stateStr": stateString})
	if len(code) == 0 {
		h.logger.Error("code-parameter-is-not-provided", nil)
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "code parameter is not provided"})
		return
	} else if len(code) > 1 {
		h.logger.Error("code-parameter-is-not-provided", nil)
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "Incorrect code parameter in query string"})
		return
	}
	if len(stateString) == 0 {
		h.logger.Error("stateString-parameter-is-not-provided", nil)
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "state parameter is not provided"})
		return
	} else if len(stateString) > 1 {
		h.logger.Error("stateString-parameter-is-not-provided", nil)
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "Incorrect state parameter in query string"})
		return
	}
	var stateInfo models.StateInfo = models.StateInfo{}
	stateInfoBytes, err := base64.StdEncoding.DecodeString(stateString[0])
	if err != nil {
		h.logger.Error("failed-to-base64-decode-statestring", err)
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "state is not valid base64 encoded"})
		return
	}
	err = json.Unmarshal(stateInfoBytes, &stateInfo)
	if err != nil {
		h.logger.Error("failed-to-unmarshal-statestring", err)
		handlers.WriteJSONResponse(w, http.StatusBadRequest, models.ErrorResponse{
			Code:        "Bad-Request",
			Description: "state is not a valid json format string"})
		return
	}
	// var tokenEndpoint string = stateInfo.TokenEndpoint
	// var userInfoEndpoint string = stateInfo.UserInfoEndpoint
	var backUrl string = stateInfo.BackUrl
	// var ccEndpoint string = stateInfo.CCEndpoint
	// var spaceId string = stateInfo.SpaceId
	// var errPage string = stateInfo.ErrorPage
	// var requestMethod string = stateInfo.RequestMethod
	var redirectUrl string = stateInfo.RedirectUrl
	// var queryString string = stateInfo.QueryString
	// queryBytes, err := base64.StdEncoding.DecodeString(queryString)
	// if err != nil {
	// 	h.logger.Error("failed-base64-decode-querystring", err, lager.Data{"query": queryString})
	// 	handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
	// 		Code:        "Internal-Server-Error",
	// 		Description: "Error getting access token"})
	// 	return
	// }
	// queryString = string(queryBytes)

	uaaToken, err := h.uaaHelper.GetUAATokenWithAuthorizationCode(code[0], h.config.Cf.Client.ClientId, h.config.Cf.Client.ClientSecret, redirectUrl)
	if err != nil {
		h.logger.Error("failed-get-token", err)
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: "Error getting access token"})
		return
	}
	h.sm.SetUAAToken(w, r, uaaToken)
	http.Redirect(w, r, backUrl, http.StatusFound)
	return

}
