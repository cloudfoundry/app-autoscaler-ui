package endpoints

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"code.cloudfoundry.org/lager"

	"scalerui/config"
	"scalerui/models"
)

const (
	CCEndpointPath    = "/v2/info"
	AuthorizationPath = "/oauth/authorize"
	TokenPath         = "/oauth/token"
	UserInfoPath      = "/userinfo"
)

type EndpointsManager struct {
	logger      lager.Logger
	httpClient  *http.Client
	config      *config.Config
	ccEndPoints *models.CCEndpoints
}

func NewEndpointsManager(logger lager.Logger, config *config.Config, httpClient *http.Client) *EndpointsManager {
	return &EndpointsManager{
		logger:     logger.Session("EndpointsManager"),
		httpClient: httpClient,
		config:     config,
	}
}

func (em *EndpointsManager) GetCCEndpoints(force bool) (*models.CCEndpoints, error) {
	if !force && em.ccEndPoints != nil {
		return em.ccEndPoints, nil
	} else {
		if err := em.initCCEndpoints(); err != nil {
			return nil, err
		} else {
			return em.ccEndPoints, nil
		}

	}
}

func (em *EndpointsManager) InitEndpointsManager() error {
	if err := em.initCCEndpoints(); err != nil {
		return err
	}
	return nil
}

func (em *EndpointsManager) initCCEndpoints() error {
	ccEndPoints, err := em.getCCEndpoints(em.config.Cf.Api)
	if err != nil {
		em.logger.Error("failed-to-get-CCEndPoints", err)
		return err
	}
	em.ccEndPoints = ccEndPoints
	return nil
}

func (em *EndpointsManager) getCCEndpoints(cfApi string) (*models.CCEndpoints, error) {
	ccEndpointUrl := cfApi + CCEndpointPath
	resp, err := em.httpClient.Get(ccEndpointUrl)
	if err != nil {
		em.logger.Error("failed-to-get-endpoints-from-cc", err, lager.Data{"ccEndpointUrl": ccEndpointUrl})
		return nil, err
	}
	defer resp.Body.Close()
	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		em.logger.Error("failed-to-read-endpoints-from-cc-response", err, lager.Data{"ccEndpointUrl": ccEndpointUrl})
		return nil, err
	}
	var ccEndPoints *models.CCEndpoints = &models.CCEndpoints{}
	err = json.Unmarshal(bodyBytes, ccEndPoints)
	if err != nil {
		em.logger.Error("failed-to-unmarshal-endpoints-from-cc-response", err, lager.Data{"body": bodyBytes})
		return nil, err
	}
	return ccEndPoints, nil

}
