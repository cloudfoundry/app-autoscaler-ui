package server_test

import (
	// "encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httptest"

	"code.cloudfoundry.org/cfhttp"
	"code.cloudfoundry.org/lager"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"scalerui/config"
	// "scalerui/models"
	. "scalerui/server"
)

var _ = Describe("IndexHandler", func() {
	var (
		conf         *config.Config
		logger       lager.Logger
		httpClient   *http.Client
		indexHandler *IndexHandler
		response     *httptest.ResponseRecorder
		params       []interface{}
		testAppId    string = "the-test-app-id"
		indexUrl     string = "https://scaleruihost/?%s=%s"
	)

	BeforeEach(func() {
		conf = &config.Config{
			Server: config.ServerConfig{
				ViewPath: "../../../view/dev",
			},
		}
		logger = lager.NewLogger("index_hanlder")
		logger.RegisterSink(lager.NewWriterSink(GinkgoWriter, lager.DEBUG))
		httpClient = cfhttp.NewClient()
	})
	Context("GetIndex", func() {
		JustBeforeEach(func() {
			url := fmt.Sprintf(indexUrl, params...)
			request, err := http.NewRequest(http.MethodGet, url, nil)
			response = httptest.NewRecorder()
			Expect(err).NotTo(HaveOccurred())
			indexHandler.HandleIndex(response, request, nil)
		})

		BeforeEach(func() {
			indexHandler = NewIndexHandler(logger, conf, httpClient)

		})
		// Context("when app_id is not provided in query parameteters", func() {
		// 	BeforeEach(func() {
		// 		params = []interface{}{"wrong-paramter-name", "value"}

		// 	})
		// 	It("returns 400", func() {
		// 		Expect(response.Code).To(Equal(http.StatusBadRequest))
		// 		errJson := &models.ErrorResponse{}
		// 		err := json.Unmarshal(response.Body.Bytes(), errJson)

		// 		Expect(err).ToNot(HaveOccurred())
		// 		Expect(errJson).To(Equal(&models.ErrorResponse{
		// 			Code:        "Bad-Request",
		// 			Description: "Failed to get appid from request parameters",
		// 		}))
		// 	})
		// })

		Context("when query parameteters are correct", func() {
			BeforeEach(func() {
				params = []interface{}{"app_id", testAppId}

			})
			It("returns 200", func() {
				Expect(response.Code).To(Equal(http.StatusOK))
				bodyBytes, err := ioutil.ReadAll(response.Body)
				Expect(err).NotTo(HaveOccurred())
				bodyStr := string(bodyBytes)
				Expect(bodyStr).Should(ContainSubstring("AutoScaler Dashboard"))

			})
		})

	})

})
