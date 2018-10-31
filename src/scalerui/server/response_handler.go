package server

import (
	"code.cloudfoundry.org/cfhttp/handlers"
	"code.cloudfoundry.org/lager"
	"fmt"
	"io/ioutil"
	"net/http"
	"scalerui/models"
	"strconv"
)

func handleResponse(resp *http.Response, logger lager.Logger, w http.ResponseWriter) {
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		logger.Error("failed-to-read-server-response", err)
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: fmt.Sprintf("Failed to get policy from api server"),
		})
		return
	}
	w.Header().Set("Content-Length", strconv.Itoa(len(body)))
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}
