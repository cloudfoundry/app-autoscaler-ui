package auth_test

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"regexp"
	"time"

	"code.cloudfoundry.org/cfhttp"
	"code.cloudfoundry.org/lager"
	"code.cloudfoundry.org/lager/lagertest"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/onsi/gomega/gbytes"
	"github.com/onsi/gomega/ghttp"

	"scalerui/auth"
	"scalerui/config"
	"scalerui/endpoints"
	"scalerui/models"
	"scalerui/session"
)

var _ = Describe("SSOCallbackHandler", func() {
	var (
		conf         *config.Config
		logger       *lagertest.TestLogger
		httpClient   *http.Client
		ssoHandler   *auth.SSOCallbackHandler
		fakeCfServer *ghttp.Server
		response     *httptest.ResponseRecorder

		sessionManager   session.SessionManager
		uaaHelper        *auth.UAAHelper
		endpointsManager *endpoints.EndpointsManager

		state               models.StateInfo
		tokens              interface{}
		ccStatus            int
		oauthEndpointStatus int
		stateStr            string
		code                string
		ccEndpoints         models.CCEndpoints
		ssoCheckUrl         string = "https://scaleruihost/SSOCheck/?%s=%s&%s=%s"
		params              []interface{}
	)

	BeforeEach(func() {
		fakeCfServer = ghttp.NewServer()
		conf = &config.Config{
			Server: config.ServerConfig{
				SessionTimeout:         600 * time.Second,
				SessionRefreshInterval: 60 * time.Second,
			},
			Cf: config.CfConfig{
				Client: config.CfClientConfig{
					ClientId:     "test-client-id",
					ClientSecret: "test-client-secret",
					Scope:        "test-scope",
				},
				Api: fakeCfServer.URL(),
			},
		}
		ccEndpoints = models.CCEndpoints{
			AuthEndpoint: fakeCfServer.URL(),
		}
		sessionManager = session.NewSessionManager(conf.Server.SessionTimeout, conf.Server.SessionRefreshInterval)
		logger = lagertest.NewTestLogger("sso_hanlder")
		logger.RegisterSink(lager.NewWriterSink(GinkgoWriter, lager.DEBUG))
		httpClient = cfhttp.NewClient()
		endpointsManager = endpoints.NewEndpointsManager(logger, conf, httpClient)
		uaaHelper = auth.NewUAAHelper(logger, conf, httpClient, endpointsManager)
		stateBytes, err := json.Marshal(state)
		Expect(err).NotTo(HaveOccurred())
		stateStr = base64.StdEncoding.EncodeToString(stateBytes)
		code = "12345"

	})
	Context("SSOCallback", func() {
		JustBeforeEach(func() {
			apiPath, _ := regexp.Compile(".*v2/info.*")
			fakeCfServer.RouteToHandler("GET", apiPath, ghttp.RespondWithJSONEncoded(ccStatus, ccEndpoints))
			tokenPath, _ := regexp.Compile(".*oauth/token.*")
			fakeCfServer.RouteToHandler("POST", tokenPath, ghttp.RespondWithJSONEncoded(oauthEndpointStatus, tokens))
			url := fmt.Sprintf(ssoCheckUrl, params...)
			request, err := http.NewRequest(http.MethodGet, url, nil)
			response = httptest.NewRecorder()
			Expect(err).NotTo(HaveOccurred())
			ssoHandler.SSOCallback(response, request, map[string]string{})

		})

		BeforeEach(func() {
			ccStatus = http.StatusOK
			oauthEndpointStatus = http.StatusOK
			tokens = models.UAAToken{
				AccessToken:  "eyJhbGciOiJIUzI1NiIsImtpZCI6ImRlZmF1bHQiLCJ0eXAiOiJKV1QifQ.eyJqdGkiOiJkMTdmMTUxNzE1M2E0M2I3YmVhMzRkZGNiYjk4NDhhMyIsInN1YiI6IjMyNTk4MzYxLTVlOWUtNDRiNC04YWQ5LTNkOTNkOTIwOWVlNyIsInNjb3BlIjpbInJvdXRpbmcucm91dGVyX2dyb3Vwcy5yZWFkIiwiY2xvdWRfY29udHJvbGxlci5yZWFkIiwicGFzc3dvcmQud3JpdGUiLCJjbG91ZF9jb250cm9sbGVyLndyaXRlIiwib3BlbmlkIiwiZG9wcGxlci5maXJlaG9zZSIsInNjaW0ud3JpdGUiLCJzY2ltLnJlYWQiLCJjbG91ZF9jb250cm9sbGVyLmFkbWluIiwidWFhLnVzZXIiXSwiY2xpZW50X2lkIjoiY2YiLCJjaWQiOiJjZiIsImF6cCI6ImNmIiwiZ3JhbnRfdHlwZSI6InBhc3N3b3JkIiwidXNlcl9pZCI6IjMyNTk4MzYxLTVlOWUtNDRiNC04YWQ5LTNkOTNkOTIwOWVlNyIsIm9yaWdpbiI6InVhYSIsInVzZXJfbmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbiIsInJldl9zaWciOiJmNTY2NjI1YiIsImlhdCI6MTUzMTEyMTIwMSwiZXhwIjoxNTMxMTIxODAxLCJpc3MiOiJodHRwczovL3VhYS5jbHVzdGVyYmNmbWFzdGVyLTgxMjk2Mi51cy1zb3V0aC5jb250YWluZXJzLmFwcGRvbWFpbi5jbG91ZDoyNzkzL29hdXRoL3Rva2VuIiwiemlkIjoidWFhIiwiYXVkIjpbInNjaW0iLCJjbG91ZF9jb250cm9sbGVyIiwicGFzc3dvcmQiLCJjZiIsInVhYSIsIm9wZW5pZCIsImRvcHBsZXIiLCJyb3V0aW5nLnJvdXRlcl9ncm91cHMiXX0.Y9FFnZUQoOQXnXjBI16i19PRDwhXMphv_djLQ6-v_3s",
				RefreshToken: "the-refresh-token",
				ExpiresIn:    10000,
			}
			ssoHandler = auth.NewSSOCallbackHandler(logger, conf, httpClient, sessionManager, uaaHelper)
		})
		Context("when code is not provide in parameter", func() {
			BeforeEach(func() {
				params = []interface{}{"not-code", "not-code", "state", stateStr}
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "code parameter is not provided",
				}))
			})
		})

		Context("when there are more than one code in parameter", func() {
			BeforeEach(func() {
				params = []interface{}{"code=" + code, "&code=" + code, "state", stateStr}
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "Incorrect code parameter in query string",
				}))
			})
		})

		Context("when state is not provide in parameter", func() {
			BeforeEach(func() {
				params = []interface{}{"code", code, "not-state", stateStr}
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "state parameter is not provided",
				}))
			})
		})

		Context("when there are more than one state in parameter", func() {
			BeforeEach(func() {
				params = []interface{}{"code", code, "state=" + stateStr, "&state=" + stateStr}
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "Incorrect state parameter in query string",
				}))
			})
		})

		Context("when state can not be base64 decoded", func() {
			BeforeEach(func() {
				params = []interface{}{"code", code, "state", "not-valid-base64-encoded-string"}
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "state is not valid base64 encoded",
				}))
			})
		})

		Context("when state can not be json unmarshalled", func() {
			BeforeEach(func() {
				params = []interface{}{"code", code, "state", base64.StdEncoding.EncodeToString([]byte("not-json-string"))}
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "state is not a valid json format string",
				}))
			})
		})

		Context("when error occurs when getUAATokenWithAuthorizationCode", func() {
			BeforeEach(func() {
				params = []interface{}{"code", code, "state", stateStr}
				fakeCfServer.Close()
			})
			It("returns 500", func() {
				Expect(response.Code).To(Equal(http.StatusInternalServerError))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Internal-Server-Error",
					Description: "Error getting access token",
				}))
				Eventually(logger.Buffer()).Should(gbytes.Say("connection refused"))
			})
		})
		Context("when successfully get accessToken", func() {
			BeforeEach(func() {
				params = []interface{}{"code", code, "state", stateStr}
			})
			It("returns 302", func() {
				Expect(response.Code).To(Equal(http.StatusFound))

			})
		})

	})

})
