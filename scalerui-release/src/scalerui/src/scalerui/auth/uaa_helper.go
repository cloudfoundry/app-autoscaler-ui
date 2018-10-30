package auth

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"code.cloudfoundry.org/cfhttp/handlers"
	"code.cloudfoundry.org/lager"

	"scalerui/config"
	"scalerui/endpoints"
	"scalerui/models"
)

type UAAHelper struct {
	logger           lager.Logger
	httpClient       *http.Client
	config           *config.Config
	endpointsManager *endpoints.EndpointsManager
}

func NewUAAHelper(logger lager.Logger, config *config.Config, httpClient *http.Client, endpointsManager *endpoints.EndpointsManager) *UAAHelper {
	return &UAAHelper{
		logger:           logger.Session("UAAHelper"),
		httpClient:       httpClient,
		config:           config,
		endpointsManager: endpointsManager,
	}
}

// func (uh *UAAHelper) initUAAHelper() error {
// 	ccEndpoints, err := uh.GetAuthorizationEndpoint(uh.config.Cf.Api)
// 	if err != nil {
// 		uh.logger.Error("failed-to-get-AuthorizationEndpoint", err)
// 		return err
// 	}
// 	uh.ccEndpoints = ccEndpoints
// 	return nil

// }

// func (uh *UAAHelper) GetAuthorizationEndpoint(cfApi string) (*models.CCEndpoints, error) {
// 	ccEndpointUrl := cfApi + CCEndpointPath
// 	resp, err := uh.httpClient.Get(ccEndpointUrl)
// 	if err != nil {
// 		uh.logger.Error("failed-to-get-endpoints-from-cc", err, lager.Data{"ccEndpointUrl": ccEndpointUrl})
// 		return nil, err
// 	}
// 	defer resp.Body.Close()
// 	bodyBytes, err := ioutil.ReadAll(resp.Body)
// 	if err != nil {
// 		uh.logger.Error("failed-to-read-endpoints-from-cc-response", err, lager.Data{"ccEndpointUrl": ccEndpointUrl})
// 		return nil, err
// 	}
// 	var ccEndpoints *models.CCEndpoints = &models.CCEndpoints{}
// 	err = json.Unmarshal(bodyBytes, ccEndpoints)
// 	if err != nil {
// 		uh.logger.Error("failed-to-unmarshal-endpoints-from-cc-response", err, lager.Data{"body": bodyBytes})
// 		return nil, err
// 	}
// 	return ccEndpoints, nil

// }

func (uh *UAAHelper) RedirectToAuthEndpoint(w http.ResponseWriter, r *http.Request) {
	// authorizationEndpoint, err := uh.GetAuthorizationEndpoint(uh.config.Cf.Api)
	// if err != nil {
	// 	uh.logger.Error("failed-to-get-AuthorizationEndpoint", err)
	// 	handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
	// 		Code:        "Internal-Server-Error",
	// 		Description: "Error doing SSO check"})
	// 	return
	// }
	ccEndpoints, err := uh.endpointsManager.GetCCEndpoints(false)
	if err != nil {
		uh.logger.Error("failed-to-get-AuthorizationEndpoint", err)
		handlers.WriteJSONResponse(w, http.StatusInternalServerError, models.ErrorResponse{
			Code:        "Internal-Server-Error",
			Description: "Error doing SSO check"})
		return
	}
	authorizationEndpoint := ccEndpoints.AuthEndpoint
	uh.logger.Debug("authorizationEndpoint", lager.Data{"authorizationEndpoint": authorizationEndpoint})
	redirectUrl := "https://" + r.Host + "/SSOCheck"
	stateInfo := models.StateInfo{
		RequestMethod:    strings.ToUpper(r.Method),
		QueryString:      base64.StdEncoding.EncodeToString([]byte(r.URL.Query().Encode())),
		RedirectUrl:      redirectUrl,
		BackUrl:          r.RequestURI,
		TokenEndpoint:    authorizationEndpoint + "/oauth/token",
		UserInfoEndpoint: authorizationEndpoint + "/userinfo",
		CCEndpoint:       "",
		OrgId:            "",
		SpaceId:          "",
		AppId:            "",
		ErrorPage:        "",
	}
	uh.logger.Debug("stateinfo", lager.Data{"stateInfo": stateInfo})
	stateInfoBytes, err := json.Marshal(stateInfo)
	if err != nil {
		uh.logger.Error("failed-to-marshal-stateinfo", err, lager.Data{"stateInfo": stateInfo})
		return
	}
	encodedStateInfo := base64.StdEncoding.EncodeToString(stateInfoBytes)
	oauthURL, err := url.Parse(authorizationEndpoint + endpoints.AuthorizationPath)
	parameters := oauthURL.Query()

	parameters.Add("response_type", "code")
	parameters.Add("client_id", uh.config.Cf.Client.ClientId)
	parameters.Add("scope", uh.config.Cf.Client.Scope)
	parameters.Add("redirect_uri", redirectUrl)
	parameters.Add("state", encodedStateInfo)
	oauthURLStr := oauthURL.String() + "?" + parameters.Encode()
	http.Redirect(w, r, oauthURLStr, http.StatusFound)
}

func (uh *UAAHelper) GetUAATokenWithAuthorizationCode(code, cfClientId, cfClientSecret, redirectUrl string) (*models.UAAToken, error) {
	ccEndpoints, err := uh.endpointsManager.GetCCEndpoints(false)
	if err != nil {
		uh.logger.Error("failed-to-get-AuthorizationEndpoint", err)
		return nil, err
	}
	authorizationEndpoint := ccEndpoints.AuthEndpoint
	tokenEndpoint := authorizationEndpoint + "/oauth/token"
	uh.logger.Debug("get-token-token-from-code", lager.Data{"tokenEndpoint": tokenEndpoint, "redirectUrl": redirectUrl})
	body := url.Values{}
	body.Set("grant_type", "authorization_code")
	body.Set("code", code)
	body.Set("client_id", cfClientId)
	body.Set("client_secret", cfClientSecret)
	body.Set("redirect_uri", redirectUrl)

	return uh.getUAAToken(body, tokenEndpoint, cfClientId, cfClientSecret)
}

func (uh *UAAHelper) GetUAATokenWithRefreshToken(refreshToken, cfClientId, cfClientSecret string) (*models.UAAToken, error) {
	// authorizationEndpoint, err := uh.GetAuthorizationEndpoint(uh.config.Cf.Api)
	// if err != nil {
	// 	uh.logger.Error("failed-to-get-AuthorizationEndpoint", err)
	// 	return nil, err
	// }
	ccEndpoints, err := uh.endpointsManager.GetCCEndpoints(false)
	if err != nil {
		uh.logger.Error("failed-to-get-AuthorizationEndpoint", err)
		return nil, err
	}
	authorizationEndpoint := ccEndpoints.AuthEndpoint
	tokenEndpoint := authorizationEndpoint + "/oauth/token"
	uh.logger.Debug("refresh-token-token", lager.Data{"tokenEndpoint": tokenEndpoint})

	body := url.Values{}
	body.Set("grant_type", "refresh_token")
	body.Set("refresh_token", refreshToken)
	body.Set("response_type", "token")

	return uh.getUAAToken(body, tokenEndpoint, cfClientId, cfClientSecret)
}
func (uh *UAAHelper) getUAAToken(body url.Values, tokenEndpoint, cfClientId, cfClientSecret string) (*models.UAAToken, error) {

	uh.logger.Debug("get-token-token-endpoint", lager.Data{"tokenEndpoint": tokenEndpoint})
	request, err := http.NewRequest(http.MethodPost, tokenEndpoint, strings.NewReader(body.Encode()))
	if err != nil {
		uh.logger.Error("failed-to-get-token-from-token-point-create-request-error", err, lager.Data{"body": body})
		return nil, err
	}

	request.SetBasicAuth(cfClientId, cfClientSecret)
	request.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Add("accept-encoding", "application/json")

	resp, err := uh.httpClient.Do(request)
	if err != nil {
		uh.logger.Error("failed-to-get-token-from-token-point-connection-error", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		var token models.UAAToken = models.UAAToken{}
		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			uh.logger.Error("failed-to-get-token-failed-to-read-response", err)
			return nil, err
		}
		err = json.Unmarshal(bodyBytes, &token)
		if err != nil {
			uh.logger.Error("failed-to-get-token-failed-to-unmarshal-response", err)
			return nil, err
		}
		err = uh.setTokenExpiry(&token)
		if err != nil {
			uh.logger.Error("failed-to-get-token-invalid-token-format", err)
			return nil, err
		} else {
			return &token, nil

		}

	} else if resp.StatusCode == http.StatusUnauthorized {
		uh.logger.Error("failed-to-get-token-from-token-point-unauthorized", err)
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		err = fmt.Errorf("client id: %s's secrect: %s expired with response: %s", cfClientId, cfClientSecret, string(bodyBytes))

		return nil, err
	} else {
		uh.logger.Error("failed-to-get-token-from-token-point-response-error", err)
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		err = fmt.Errorf("authorization failed with token point %s and body %s - response code %d \r\n %s", tokenEndpoint, body, resp.StatusCode, string(bodyBytes))
		return nil, err
	}
}

func (uh *UAAHelper) setTokenExpiry(token *models.UAAToken) error {
	var u *models.JWTUserTokenInfo
	accessToken := token.AccessToken
	accessTokenWithoutPrefix := strings.TrimPrefix(accessToken, "bearer ")
	splits := strings.Split(accessTokenWithoutPrefix, ".")

	if len(splits) < 3 {
		return errors.New("Token was poorly formed.")
	}
	decoded, err := base64.RawStdEncoding.DecodeString(splits[1])
	if err != nil {
		uh.logger.Error("failed-to-get-token-from-token-point-falied-to-base64-decode-token", err)
		return errors.New("Unable to decode token string.")
	}

	if err = json.Unmarshal(decoded, &u); err != nil {
		uh.logger.Error("failed-to-get-token-from-token-point-falied-to-base64-decode-token", err)
		return errors.New("Failed to unmarshall decoded token.")
	}
	token.TokenExpiry = u.TokenExpiry
	return nil
}
