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

var _ = Describe("MetricHandler", func() {
	var (
		conf          *config.Config
		logger        lager.Logger
		httpClient    *http.Client
		metricHandler *MetricHandler
		fakeApiServer *ghttp.Server
		response      *httptest.ResponseRecorder

		startTime      string
		endTime        string
		order          string
		page           string
		resultsPerPage string

		testAppId             string              = "the-test-app-id"
		metricType            string              = "memory_used"
		metricsHistoryRegPath                     = regexp.MustCompile(`^/v1/apps/.*/metric_histories/.*$`)
		metricsUrl            string              = "https://scaleruihost/v1/apps/%s/metric_histories/%s?start-time=%s&end-time=%s&order=%s&page=%s&results-per-page=%s"
		metrics               []AppInstanceMetric = []AppInstanceMetric{
			AppInstanceMetric{
				AppId:         testAppId,
				InstanceIndex: 0,
				CollectedAt:   111,
				Name:          metricType,
				Unit:          "MB",
				Value:         "123",
				Timestamp:     111,
			},
			AppInstanceMetric{
				AppId:         testAppId,
				InstanceIndex: 0,
				CollectedAt:   222,
				Name:          metricType,
				Unit:          "MB",
				Value:         "456",
				Timestamp:     222,
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
		logger = lager.NewLogger("metric_hanlder")
		logger.RegisterSink(lager.NewWriterSink(GinkgoWriter, lager.DEBUG))
		httpClient = cfhttp.NewClient()
	})
	Context("GetMetricHistories", func() {
		JustBeforeEach(func() {
			url := fmt.Sprintf(metricsUrl, testAppId, metricType, startTime, endTime, order, page, resultsPerPage)
			request, err := http.NewRequest(http.MethodGet, url, nil)
			response = httptest.NewRecorder()
			Expect(err).NotTo(HaveOccurred())
			metricHandler.GetMetricHistories(response, request, map[string]string{"appid": testAppId, "metrictype": metricType})
		})

		BeforeEach(func() {
			metricHandler = NewMetricHandler(logger, conf, httpClient)
			fakeApiServer.RouteToHandler("GET", metricsHistoryRegPath, ghttp.RespondWithJSONEncoded(http.StatusOK, ApiServerMetricsResponse{
				TotalResults: 2,
				TotalPages:   1,
				Page:         1,
				Resources:    metrics,
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
					Description: fmt.Sprintf("Failed to retrieve metrics from api server"),
				}))
			})
		})

		Context("all parameters are valid", func() {
			It("returns metrics", func() {
				Expect(response.Code).To(Equal(http.StatusOK))
				apiServerResponse := &ApiServerMetricsResponse{}
				err := json.Unmarshal(response.Body.Bytes(), apiServerResponse)

				Expect(err).ToNot(HaveOccurred())
				Expect(apiServerResponse).To(Equal(&ApiServerMetricsResponse{
					TotalResults: 2,
					TotalPages:   1,
					Page:         1,
					Resources:    metrics,
				}))
			})

		})

	})

})
