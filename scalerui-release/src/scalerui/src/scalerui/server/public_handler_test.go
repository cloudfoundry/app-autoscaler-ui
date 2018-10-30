package server_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"

	"code.cloudfoundry.org/cfhttp"
	"code.cloudfoundry.org/lager"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"scalerui/config"
	"scalerui/models"
	. "scalerui/server"
)

var _ = Describe("PublicHandler", func() {
	var (
		conf          *config.Config
		logger        lager.Logger
		httpClient    *http.Client
		publicHandler *PublicHandler
		response      *httptest.ResponseRecorder

		publicInfoUrl        string = "https://scaleruihost/v1/public/info"
		publicHealthCheckUrl string = "https://scaleruihost/v1/public/health_check"
	)

	BeforeEach(func() {
		conf = &config.Config{}
		logger = lager.NewLogger("public_hanlder")
		logger.RegisterSink(lager.NewWriterSink(GinkgoWriter, lager.DEBUG))
		httpClient = cfhttp.NewClient()
		publicHandler = NewPublicHandler(logger, conf, httpClient)
	})
	Context("GetPublicInfo", func() {
		JustBeforeEach(func() {
			request, err := http.NewRequest(http.MethodGet, publicInfoUrl, nil)
			response = httptest.NewRecorder()
			Expect(err).NotTo(HaveOccurred())
			publicHandler.GetInfo(response, request, map[string]string{})
		})
		It("returns the public info", func() {
			Expect(response.Code).To(Equal(http.StatusOK))
			serverResponse := (string)(response.Body.Bytes())
			var publicInfo models.PublicInfo
			err := json.Unmarshal([]byte(serverResponse), &publicInfo)
			Expect(err).NotTo(HaveOccurred())
			Expect(publicInfo.Version).NotTo(Equal(""))
		})
	})
	Context("GetPublicHealthCheck", func() {
		JustBeforeEach(func() {
			request, err := http.NewRequest(http.MethodGet, publicHealthCheckUrl, nil)
			response = httptest.NewRecorder()
			Expect(err).NotTo(HaveOccurred())
			publicHandler.GetHealthCheck(response, request, map[string]string{})
		})
		It("returns the public health check", func() {
			Expect(response.Code).To(Equal(http.StatusOK))
			serverResponse := (string)(response.Body.Bytes())
			var publicHealthCheck models.PublicHealth
			err := json.Unmarshal([]byte(serverResponse), &publicHealthCheck)
			Expect(err).NotTo(HaveOccurred())
			Expect(publicHealthCheck.Status).To(Equal(true))
		})
	})

})
