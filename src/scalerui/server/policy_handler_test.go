package server_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"

	"code.cloudfoundry.org/cfhttp"
	"code.cloudfoundry.org/lager"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/onsi/gomega/ghttp"

	"scalerui/config"
	"scalerui/models"
	. "scalerui/server"
)

var _ = Describe("PolicyHandler", func() {
	var (
		conf          *config.Config
		logger        lager.Logger
		httpClient    *http.Client
		policyHandler *PolicyHandler
		fakeApiServer *ghttp.Server
		response      *httptest.ResponseRecorder

		testAppId     string = "the-test-app-id"
		policyRegPath        = regexp.MustCompile(`^/v1/apps/.*/policy$`)
		policyUrl     string = "https://scaleruihost/v1/apps/%s/policy"
	)

	BeforeEach(func() {
		fakeApiServer = ghttp.NewServer()
		conf = &config.Config{
			ApiServer: config.ApiServerConfig{
				Url: fakeApiServer.URL(),
			},
		}
		logger = lager.NewLogger("policy_hanlder")
		logger.RegisterSink(lager.NewWriterSink(GinkgoWriter, lager.DEBUG))
		httpClient = cfhttp.NewClient()
		policyHandler = NewPolicyHandler(logger, conf, httpClient)
	})
	Context("GetPolicy", func() {
		JustBeforeEach(func() {
			fakeApiServer.RouteToHandler(http.MethodGet, policyRegPath, ghttp.RespondWith(http.StatusOK, "policy-content"))
			url := fmt.Sprintf(policyUrl, testAppId)
			request, err := http.NewRequest(http.MethodGet, url, nil)
			response = httptest.NewRecorder()
			Expect(err).NotTo(HaveOccurred())
			policyHandler.GetPolicy(response, request, map[string]string{"appid": testAppId})

		})
		Context("when scalerui failed to connect to api server", func() {
			BeforeEach(func() {
				fakeApiServer.Close()
			})
			It("returns 500", func() {
				Expect(response.Code).To(Equal(http.StatusInternalServerError))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Internal-Server-Error",
					Description: fmt.Sprintf("Failed to get policy from api server"),
				}))
			})
		})

		Context("get response from api server", func() {
			It("returns the response from api server", func() {
				Expect(response.Code).To(Equal(http.StatusOK))
				apiServerResponse := (string)(response.Body.Bytes())
				Expect(apiServerResponse).To(Equal("policy-content"))
			})
		})
	})

	Context("UpdatePolicy", func() {
		JustBeforeEach(func() {
			fakeApiServer.RouteToHandler(http.MethodPut, policyRegPath, ghttp.RespondWith(http.StatusOK, "policy-content"))
			url := fmt.Sprintf(policyUrl, testAppId)
			request, err := http.NewRequest(http.MethodPut, url, strings.NewReader("policy-content"))
			response = httptest.NewRecorder()
			Expect(err).NotTo(HaveOccurred())
			policyHandler.UpdatePolicy(response, request, map[string]string{"appid": testAppId})

		})
		Context("when scalerui failed to connect to api server", func() {
			BeforeEach(func() {
				fakeApiServer.Close()
			})
			It("returns 500", func() {
				Expect(response.Code).To(Equal(http.StatusInternalServerError))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Internal-Server-Error",
					Description: fmt.Sprintf("Failed to update policy from api server"),
				}))
			})
		})

		Context("get response from api server", func() {
			It("returns the response from api server", func() {
				Expect(response.Code).To(Equal(http.StatusOK))
				apiServerResponse := (string)(response.Body.Bytes())
				Expect(apiServerResponse).To(Equal("policy-content"))
			})
		})
	})

	Context("DeletePolicy", func() {
		JustBeforeEach(func() {
			fakeApiServer.RouteToHandler(http.MethodDelete, policyRegPath, ghttp.RespondWith(http.StatusOK, "policy-content"))
			url := fmt.Sprintf(policyUrl, testAppId)
			request, err := http.NewRequest(http.MethodDelete, url, strings.NewReader("policy-content"))
			response = httptest.NewRecorder()
			Expect(err).NotTo(HaveOccurred())
			policyHandler.DeletePolicy(response, request, map[string]string{"appid": testAppId})

		})
		Context("when scalerui failed to connect to api server", func() {
			BeforeEach(func() {
				fakeApiServer.Close()
			})
			It("returns 500", func() {
				Expect(response.Code).To(Equal(http.StatusInternalServerError))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Internal-Server-Error",
					Description: fmt.Sprintf("Failed to delete policy from api server"),
				}))
			})
		})

		Context("get response from api server", func() {
			It("returns the response from api server", func() {
				Expect(response.Code).To(Equal(http.StatusOK))
				apiServerResponse := (string)(response.Body.Bytes())
				Expect(apiServerResponse).To(Equal("policy-content"))
			})
		})
	})

})
