package server_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"

	"code.cloudfoundry.org/lager"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"scalerui/models"
	. "scalerui/server"
)

var _ = Describe("NotFoundHandler", func() {
	var (
		logger lager.Logger
		// httpClient      *http.Client
		notfoundHandler *NotFoundHandler
		response        *httptest.ResponseRecorder
		indexUrl        string = "https://scaleruihost"
	)

	BeforeEach(func() {

		logger = lager.NewLogger("not_found_hanlder")
		logger.RegisterSink(lager.NewWriterSink(GinkgoWriter, lager.DEBUG))
		// httpClient = cfhttp.NewClient()
	})
	Context("HandleNotFound", func() {
		JustBeforeEach(func() {
			request, err := http.NewRequest(http.MethodGet, indexUrl, nil)
			response = httptest.NewRecorder()
			Expect(err).NotTo(HaveOccurred())
			notfoundHandler.HandleNotFound(response, request, nil)
		})

		BeforeEach(func() {
			notfoundHandler = NewNotFoundHandler(logger)

		})
		Context("when request comes", func() {
			It("returns 404", func() {
				Expect(response.Code).To(Equal(http.StatusNotFound))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Not-Found",
					Description: "No-handler-for-url",
				}))
			})
		})

	})

})
