package routes_test

import (
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"scalerui/routes"
)

var _ = Describe("Routes", func() {

	var (
		testAppId      string = "testAppId"
		testServiceId  string = "testServiceId"
		testMetricType string = "testMetricType"
	)
	Describe("ScalerUiRoutes", func() {
		Context("GetAggregatedMetricHistoriesRoute", func() {
			Context("when provide correct route variable", func() {
				It("should return the correct path", func() {
					path, err := routes.ScalerUiRoutes().Get(routes.GetAggregatedMetricHistoriesRouteName).URLPath("appid", testAppId, "metrictype", testMetricType)
					Expect(err).NotTo(HaveOccurred())
					Expect(path.Path).To(Equal("/v1/apps/" + testAppId + "/aggregated_metric_histories/" + testMetricType))
				})
			})

			Context("when provide wrong route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.GetAggregatedMetricHistoriesRouteName).URLPath("wrongVariable", testAppId)
					Expect(err).To(HaveOccurred())

				})
			})

			Context("when provide not enough route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.GetAggregatedMetricHistoriesRouteName).URLPath("appid", testAppId)
					Expect(err).To(HaveOccurred())

				})
			})
		})

		Context("GetMetricHistoriesRoute", func() {
			Context("when provide correct route variable", func() {
				It("should return the correct path", func() {
					path, err := routes.ScalerUiRoutes().Get(routes.GetMetricHistoriesRouteName).URLPath("appid", testAppId, "metrictype", testMetricType)
					Expect(err).NotTo(HaveOccurred())
					Expect(path.Path).To(Equal("/v1/apps/" + testAppId + "/metric_histories/" + testMetricType))
				})
			})

			Context("when provide wrong route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.GetMetricHistoriesRouteName).URLPath("wrongVariable", testAppId)
					Expect(err).To(HaveOccurred())

				})
			})

			Context("when provide not enough route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.GetMetricHistoriesRouteName).URLPath("appid", testAppId)
					Expect(err).To(HaveOccurred())

				})
			})
		})

		Context("GetScalingHistoriesRoute", func() {
			Context("when provide correct route variable", func() {
				It("should return the correct path", func() {
					path, err := routes.ScalerUiRoutes().Get(routes.GetScalingHistoriesRouteName).URLPath("appid", testAppId)
					Expect(err).NotTo(HaveOccurred())
					Expect(path.Path).To(Equal("/v1/apps/" + testAppId + "/scaling_histories"))
				})
			})

			Context("when provide wrong route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.GetScalingHistoriesRouteName).URLPath("wrongVariable", testAppId)
					Expect(err).To(HaveOccurred())

				})
			})

			Context("when provide not enough route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.GetScalingHistoriesRouteName).URLPath()
					Expect(err).To(HaveOccurred())

				})
			})
		})

		Context("GetPolicyRouteName", func() {
			Context("when provide correct route variable", func() {
				It("should return the correct path", func() {
					path, err := routes.ScalerUiRoutes().Get(routes.GetPolicyRouteName).URLPath("appid", testAppId)
					Expect(err).NotTo(HaveOccurred())
					Expect(path.Path).To(Equal("/v1/apps/" + testAppId + "/policy"))
				})
			})

			Context("when provide wrong route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.GetPolicyRouteName).URLPath("wrongVariable", testAppId)
					Expect(err).To(HaveOccurred())

				})
			})

			Context("when provide not enough route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.GetPolicyRouteName).URLPath()
					Expect(err).To(HaveOccurred())

				})
			})
		})

		Context("SSOCheckRouteName", func() {
			It("should return the correct path", func() {
				path, err := routes.ScalerUiRoutes().Get(routes.SSOCheckRouteName).URLPath()
				Expect(err).NotTo(HaveOccurred())
				Expect(path.Path).To(Equal("/SSOCheck"))
			})
		})

		Context("ServiceIndexGetRoute", func() {
			Context("when provide correct route variable", func() {
				It("should return the correct path", func() {
					path, err := routes.ScalerUiRoutes().Get(routes.ServiceIndexGetRouteName).URLPath("serviceid", testServiceId)
					Expect(err).NotTo(HaveOccurred())
					Expect(path.Path).To(Equal("/manage/" + testServiceId))
				})
			})

			Context("when provide wrong route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.ServiceIndexGetRouteName).URLPath("wrongVariable", testServiceId)
					Expect(err).To(HaveOccurred())

				})
			})

			Context("when provide not enough route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.ServiceIndexGetRouteName).URLPath()
					Expect(err).To(HaveOccurred())

				})
			})
		})

		Context("AppIndexGetRoute", func() {
			Context("when provide correct route variable", func() {
				It("should return the correct path", func() {
					path, err := routes.ScalerUiRoutes().Get(routes.AppIndexGetRouteName).URLPath("appid", testAppId)
					Expect(err).NotTo(HaveOccurred())
					Expect(path.Path).To(Equal("/apps/" + testAppId))
				})
			})

			Context("when provide wrong route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.AppIndexGetRouteName).URLPath("wrongVariable", testAppId)
					Expect(err).To(HaveOccurred())

				})
			})

			Context("when provide not enough route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.AppIndexGetRouteName).URLPath()
					Expect(err).To(HaveOccurred())

				})
			})
		})

		Context("ServiceApplicationsRoute", func() {
			Context("when provide correct route variable", func() {
				It("should return the correct path", func() {
					path, err := routes.ScalerUiRoutes().Get(routes.ServiceApplicationsRouteName).URLPath("serviceid", testServiceId)
					Expect(err).NotTo(HaveOccurred())
					Expect(path.Path).To(Equal("/v1/services/" + testServiceId + "/apps"))
				})
			})

			Context("when provide wrong route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.ServiceApplicationsRouteName).URLPath("wrongVariable", testServiceId)
					Expect(err).To(HaveOccurred())

				})
			})

			Context("when provide not enough route variable", func() {
				It("should return error", func() {
					_, err := routes.ScalerUiRoutes().Get(routes.ServiceApplicationsRouteName).URLPath()
					Expect(err).To(HaveOccurred())

				})
			})
		})

	})
})
