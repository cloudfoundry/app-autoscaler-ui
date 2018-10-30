package endpoints_test

import (
	"net/http"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/onsi/gomega/gbytes"
	"github.com/onsi/gomega/ghttp"

	"code.cloudfoundry.org/cfhttp"
	"code.cloudfoundry.org/lager"
	"code.cloudfoundry.org/lager/lagertest"

	"scalerui/config"
	. "scalerui/endpoints"
	"scalerui/models"
)

var _ = Describe("Endpoints", func() {
	var (
		endpointsManager    *EndpointsManager
		ccApiFakeServer     *ghttp.Server
		conf                *config.Config
		logger              *lagertest.TestLogger
		httpClient          *http.Client
		force               bool = false
		ccEndpoints         *models.CCEndpoints
		err                 error
		ccEndpointsResponse = models.CCEndpoints{
			AuthEndpoint: "https://the-auth-endpoint",
		}
		anotherCCEndpointsResponse = models.CCEndpoints{
			AuthEndpoint: "https://another-auth-endpoint",
		}
	)

	BeforeEach(func() {
		logger = lagertest.NewTestLogger("endpointsManager")
		logger.RegisterSink(lager.NewWriterSink(GinkgoWriter, lager.DEBUG))
		httpClient = cfhttp.NewClient()
		ccApiFakeServer = ghttp.NewServer()
		conf = &config.Config{
			Cf: config.CfConfig{
				Api: ccApiFakeServer.URL(),
			},
		}
		endpointsManager = NewEndpointsManager(logger, conf, httpClient)

	})

	Context("GetCCEndPoints", func() {
		JustBeforeEach(func() {
			ccEndpoints, err = endpointsManager.GetCCEndpoints(force)
		})
		Context("get cc endpoints successfully", func() {
			BeforeEach(func() {
				ccApiFakeServer.RouteToHandler(http.MethodGet, CCEndpointPath, ghttp.RespondWithJSONEncoded(http.StatusOK, ccEndpointsResponse))
			})
			It("return cc endpoints without error", func() {
				Expect(err).To(BeNil())
				Expect(*ccEndpoints).To(Equal(ccEndpointsResponse))
				By("force is false, get cc endpoints from cache")
				ccApiFakeServer.RouteToHandler(http.MethodGet, CCEndpointPath, ghttp.RespondWithJSONEncoded(http.StatusOK, anotherCCEndpointsResponse))
				ccEndpoints, err = endpointsManager.GetCCEndpoints(false)
				Expect(err).To(BeNil())
				Expect(*ccEndpoints).To(Equal(ccEndpointsResponse))
				By("force is false, get cc endpoints from cache")
				ccEndpoints, err = endpointsManager.GetCCEndpoints(true)
				Expect(err).To(BeNil())
				Expect(*ccEndpoints).To(Equal(anotherCCEndpointsResponse))
			})
		})

		Context("failed to connect to cc api", func() {
			BeforeEach(func() {
				ccApiFakeServer.Close()
			})
			It("return error with nil cc endpoints", func() {
				Expect(ccEndpoints).To(BeNil())
				Expect(err).NotTo(BeNil())
				Eventually(logger.Buffer()).Should(gbytes.Say("connection refused"))
			})
		})

		Context("when failed to unmarshal response body of cc api", func() {
			BeforeEach(func() {
				ccApiFakeServer.RouteToHandler(http.MethodGet, CCEndpointPath, ghttp.RespondWithJSONEncoded(http.StatusOK, ""))
			})
			It("returns error", func() {
				Expect(ccEndpoints).To(BeNil())
				Expect(err).NotTo(BeNil())
				Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-unmarshal-endpoints-from-cc-response"))
			})
		})
	})

})
