package server_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"regexp"

	"code.cloudfoundry.org/cfhttp"
	"code.cloudfoundry.org/lager"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/onsi/gomega/ghttp"

	"scalerui/config"
	"scalerui/models"
	. "scalerui/server"
)

var _ = Describe("ScalingHistoryHandler", func() {
	var (
		conf                  *config.Config
		logger                lager.Logger
		httpClient            *http.Client
		scalingHistoryHandler *ScalingHistoryHandler
		fakeApiServer         *ghttp.Server
		response              *httptest.ResponseRecorder

		startTime      string
		endTime        string
		order          string
		page           string
		resultsPerPage string

		testAppId                      string              = "the-test-app-id"
		scalingHistoriesHistoryRegPath                     = regexp.MustCompile(`^/v1/apps/.*/scaling_histories.*$`)
		scalingHistoriesUrl            string              = "https://scaleruihost/v1/apps/%s/scaling_histories/?start-time=%s&end-time=%s&order=%s&page=%s&results-per-page=%s"
		scalingHistories               []AppScalingHistory = []AppScalingHistory{
			AppScalingHistory{
				AppId:        testAppId,
				Timestamp:    111,
				ScalingType:  ScalingTypeDynamic,
				Status:       ScalingStatusSucceeded,
				OldInstances: 1,
				NewInstances: 2,
				Reason:       "the-reason",
				Message:      "the-message",
				Error:        "",
			},
			AppScalingHistory{
				AppId:        testAppId,
				Timestamp:    222,
				ScalingType:  ScalingTypeDynamic,
				Status:       ScalingStatusSucceeded,
				OldInstances: 2,
				NewInstances: 3,
				Reason:       "the-reason",
				Message:      "the-message",
				Error:        "",
			},
		}
	)

	BeforeEach(func() {
		fakeApiServer = ghttp.NewServer()
		conf = &config.Config{
			ApiServer: config.ApiServerConfig{
				Url: fakeApiServer.URL(),
			},
		}
		logger = lager.NewLogger("scalingHistory_hanlder")
		logger.RegisterSink(lager.NewWriterSink(GinkgoWriter, lager.DEBUG))
		httpClient = cfhttp.NewClient()
	})
	Context("GetScalingHistories", func() {
		JustBeforeEach(func() {
			url := fmt.Sprintf(scalingHistoriesUrl, testAppId, startTime, endTime, order, page, resultsPerPage)
			request, err := http.NewRequest(http.MethodGet, url, nil)
			response = httptest.NewRecorder()
			Expect(err).NotTo(HaveOccurred())
			scalingHistoryHandler.GetScalingHistories(response, request, map[string]string{"appid": testAppId})
		})

		BeforeEach(func() {
			scalingHistoryHandler = NewScalingHistoryHandler(logger, conf, httpClient)
			fakeApiServer.RouteToHandler("GET", scalingHistoriesHistoryRegPath, ghttp.RespondWithJSONEncoded(http.StatusOK, ApiServerScalingHistoryResponse{
				TotalResults: 2,
				TotalPages:   1,
				Page:         1,
				Resources:    scalingHistories,
			}))

			startTime = "0"
			endTime = "222222"
			order = "asc"
			page = "1"
			resultsPerPage = "10"
		})
		Context("when start-time param is not integer", func() {
			BeforeEach(func() {
				startTime = "not-integer"
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "Error parsing start time",
				}))
			})
		})

		Context("when there are more than one start-time param", func() {
			BeforeEach(func() {
				startTime = "111&start-time=111"
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "Incorrect start parameter in query string",
				}))
			})
		})

		Context("when end-time param is not integer", func() {
			BeforeEach(func() {
				endTime = "not-integer"
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "Error parsing end time",
				}))
			})
		})

		Context("when there are more than one end-time param", func() {
			BeforeEach(func() {
				endTime = "111&end-time=111"
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "Incorrect end parameter in query string",
				}))
			})
		})

		Context("when order param is not integer", func() {
			BeforeEach(func() {
				order = "not-asc-or-desc"
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: fmt.Sprintf("Incorrect order parameter in query string, the value can only be %s or %s", models.ASCSTR, models.DESCSTR),
				}))
			})
		})

		Context("when there are more than one order param", func() {
			BeforeEach(func() {
				order = "asc&order=asc"
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "Incorrect order parameter in query string",
				}))
			})
		})

		Context("when page param is not integer", func() {
			BeforeEach(func() {
				page = "not-integer"
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "Error parsing page",
				}))
			})
		})

		Context("when there are more than one page param", func() {
			BeforeEach(func() {
				page = "1&page=1"
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "Incorrect page parameter in query string",
				}))
			})
		})

		Context("when results-per-page param is not integer", func() {
			BeforeEach(func() {
				resultsPerPage = "not-integer"
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "Error parsing results-per-page",
				}))
			})
		})

		Context("when there are more than one result-per-page param", func() {
			BeforeEach(func() {
				resultsPerPage = "1&results-per-page=1"
			})
			It("returns 400", func() {
				Expect(response.Code).To(Equal(http.StatusBadRequest))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Bad-Request",
					Description: "Incorrect results-per-page parameter in query string",
				}))
			})
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
					Description: fmt.Sprintf("Failed to retrieve scaling histories from api server"),
				}))
			})
		})

		Context("all parameters are valid", func() {
			It("returns scalingHistories", func() {
				Expect(response.Code).To(Equal(http.StatusOK))
				apiServerResponse := &ApiServerScalingHistoryResponse{}
				err := json.Unmarshal(response.Body.Bytes(), apiServerResponse)

				Expect(err).ToNot(HaveOccurred())
				Expect(apiServerResponse).To(Equal(&ApiServerScalingHistoryResponse{
					TotalResults: 2,
					TotalPages:   1,
					Page:         1,
					Resources:    scalingHistories,
				}))
			})

		})

	})

})
