package main_test

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	. "github.com/onsi/gomega/gbytes"
	. "github.com/onsi/gomega/gexec"
)

var _ = Describe("Ui", func() {
	var (
		runner *ScalerUiRunner
	)

	BeforeEach(func() {
		runner = NewScalerUiRunner()
	})

	AfterEach(func() {
		runner.KillWithFire()
	})

	Context("start", func() {
		JustBeforeEach(func() {
			runner.Start()
		})
		Context("all configurations are correct", func() {
			BeforeEach(func() {
				fakeApiServerRest()
			})
			It("should start", func() {
				Eventually(runner.Session.Buffer, 2*time.Second).Should(Say("scalerui.started"))
				Consistently(runner.Session).ShouldNot(Exit())
			})
		})
		Context("with a missing config file", func() {
			BeforeEach(func() {
				runner.configPath = "wrong-config-file-path"
			})

			It("fails with an error", func() {
				Eventually(runner.Session).Should(Exit(1))
				Expect(runner.Session.Buffer()).To(Say("failed to open config file"))
			})
		})

		Context("with an invalid config file", func() {
			BeforeEach(func() {
				badfile, err := ioutil.TempFile("", "bad-scalerui-config")
				Expect(err).NotTo(HaveOccurred())
				runner.configPath = badfile.Name()
				ioutil.WriteFile(runner.configPath, []byte("wrong-content"), os.ModePerm)
			})

			AfterEach(func() {
				os.Remove(runner.configPath)
			})

			It("fails with an error", func() {
				Eventually(runner.Session).Should(Exit(1))
				Expect(runner.Session.Buffer()).To(Say("failed to read config file"))
			})
		})

		Context("with missing configuration", func() {
			BeforeEach(func() {
				missingConfig := cfg
				uiPort = 9900 + GinkgoParallelNode()
				missingConfig.Server.Port = uiPort
				missingConfig.Server.ViewPath = "../../../../../view"

				missingConfig.Logging.Level = "info"

				missingConfig.ApiServer.Url = ""
				runner.configPath = writeConfig(&missingConfig).Name()
			})

			AfterEach(func() {
				os.Remove(runner.configPath)
			})

			It("should fail validation", func() {
				Eventually(runner.Session).Should(Exit(1))
				Expect(runner.Session.Buffer()).To(Say("failed to validate configuration"))
			})
		})

		Context("with missing view path", func() {
			BeforeEach(func() {
				missingConfig := cfg
				uiPort = 9900 + GinkgoParallelNode()
				missingConfig.Server.Port = uiPort
				missingConfig.Server.ViewPath = "wrong-view-path"

				missingConfig.Logging.Level = "info"

				runner.configPath = writeConfig(&missingConfig).Name()
			})

			AfterEach(func() {
				os.Remove(runner.configPath)
			})

			It("should fail validation", func() {
				Eventually(runner.Session).Should(Exit(1))
				Expect(runner.Session.Buffer()).To(Say("failed to validate view path"))
			})
		})

		Context("when an interrupt is sent", func() {
			BeforeEach(func() {
				fakeApiServerRest()
			})
			It("should stop", func() {
				Eventually(runner.Session.Buffer, 2*time.Second).Should(Say("scalerui.started"))
				Consistently(runner.Session).ShouldNot(Exit())
				runner.Session.Interrupt()
				Eventually(runner.Session, 5).Should(Exit(0))
			})
		})
	})
	Context("security header", func() {
		BeforeEach(func() {
			os.Setenv("ENABLE_CLICKJACKING_PREVENTION", "true")
			fakeApiServerRest()
			runner.Start()
			Eventually(runner.Session.Buffer, 2*time.Second).Should(Say("scalerui.started"))
			Consistently(runner.Session).ShouldNot(Exit())

		})
		AfterEach(func() {
			os.Unsetenv("ENABLE_CLICKJACKING_PREVENTION")
		})
		Context("clickjacking", func() {
			It("returns reponse with security header", func() {
				request, err := http.NewRequest(http.MethodGet, fmt.Sprintf("http://127.0.0.1:%d/manage/test-service-id?app_id=testappid", uiPort), strings.NewReader(""))
				Expect(err).NotTo(HaveOccurred())
				request.Header.Add("Authorization", "the-token")
				rsp, err := httpClient.Do(request)
				Expect(err).NotTo(HaveOccurred())
				Expect(rsp.StatusCode).To(Equal(http.StatusOK))
				Expect(rsp.Header).Should(HaveKey("X-Frame-Options"))
				Expect(rsp.Header["X-Frame-Options"]).To(Equal([]string{cfg.Server.ConsoleURL}))
				Expect(rsp.Header).Should(HaveKey("Content-Security-Policy"))
				Expect(rsp.Header["Content-Security-Policy"]).To(Equal([]string{"frame-ancestors 'self' " + cfg.Server.ConsoleURL}))
				rsp.Body.Close()
			})
		})
	})

	Context("https redirection", func() {
		BeforeEach(func() {
			os.Setenv("ENABLE_HTTPS_REDIRETION", "true")
			fakeApiServerRest()
			runner.Start()
			Eventually(runner.Session.Buffer, 2*time.Second).Should(Say("scalerui.started"))
			Consistently(runner.Session).ShouldNot(Exit())

		})
		AfterEach(func() {
			os.Unsetenv("ENABLE_HTTPS_REDIRETION")
		})
		Context("redirect to https url", func() {
			It("returns error", func() {
				request, err := http.NewRequest(http.MethodGet, fmt.Sprintf("http://127.0.0.1:%d/manage/test-service-id?app_id=testappid", uiPort), strings.NewReader(""))
				Expect(err).NotTo(HaveOccurred())
				request.Header.Add("Authorization", "the-token")
				_, err = httpClient.Do(request)
				Expect(err).To(HaveOccurred())
				Expect(err.Error()).To(ContainSubstring("http: server gave HTTP response to HTTPS client"))
			})
		})
	})

	// Context("SSO check", func() {
	// 	BeforeEach(func() {
	// 		os.Setenv("ENABLE_SSO_PREVENTION", "true")
	// 		fakeApiServerRest()
	// 		runner.Start()
	// 		Eventually(runner.Session.Buffer, 2*time.Second).Should(Say("scalerui.started"))
	// 		Consistently(runner.Session).ShouldNot(Exit())

	// 	})
	// 	AfterEach(func() {
	// 		os.Unsetenv("ENABLE_SSO_PREVENTION")
	// 	})
	// 	Context("redirect to https url", func() {
	// 		It("redirect to sso login", func() {
	// 			request, err := http.NewRequest(http.MethodGet, fmt.Sprintf("http://127.0.0.1:%d/manage/test-service-id?app_id=testappid", uiPort), strings.NewReader(""))
	// 			Expect(err).NotTo(HaveOccurred())
	// 			// request.Header.Add("Authorization", "the-token")
	// 			rsp, err := httpClient.Do(request)
	// 			Expect(err).NotTo(HaveOccurred())
	// 			Expect(rsp.StatusCode).To(Equal(http.StatusFound))
	// 			rsp.Body.Close()
	// 		})
	// 	})
	// })

	Context("scalerui rest api", func() {

		BeforeEach(func() {
			fakeApiServerRest()
			runner.Start()
			Eventually(runner.Session.Buffer, 2*time.Second).Should(Say("scalerui.started"))
			Consistently(runner.Session).ShouldNot(Exit())

		})

		Context("get index page", func() {
			Context("when params are correct", func() {
				It("returns with apiserver response", func() {

					request, err := http.NewRequest(http.MethodGet, fmt.Sprintf("http://127.0.0.1:%d/manage/test-service-id?app_id=testappid", uiPort), strings.NewReader(""))
					Expect(err).NotTo(HaveOccurred())
					request.Header.Add("Authorization", "the-token")
					rsp, err := httpClient.Do(request)
					Expect(err).NotTo(HaveOccurred())
					Expect(rsp.StatusCode).To(Equal(http.StatusOK))
					bodyBytes, err := ioutil.ReadAll(rsp.Body)
					Expect(err).NotTo(HaveOccurred())
					bodyStr := string(bodyBytes)
					Expect(bodyStr).Should(ContainSubstring("AutoScaler Dashboard"))
					rsp.Body.Close()
				})
			})

			// Context("when appid is not provided", func() {
			// 	It("returns with apiserver response", func() {

			// 		request, err := http.NewRequest(http.MethodGet, fmt.Sprintf("http://127.0.0.1:%d/manage/test-service-id?some=some", uiPort), strings.NewReader(""))
			// 		Expect(err).NotTo(HaveOccurred())
			// 		request.Header.Add("Authorization", "the-token")
			// 		rsp, err := httpClient.Do(request)
			// 		Expect(err).NotTo(HaveOccurred())
			// 		Expect(rsp.StatusCode).To(Equal(http.StatusBadRequest))
			// 		bodyBytes, err := ioutil.ReadAll(rsp.Body)
			// 		Expect(err).NotTo(HaveOccurred())
			// 		bodyStr := string(bodyBytes)
			// 		Expect(bodyStr).Should(ContainSubstring("Failed to get appid from request parameters"))
			// 		rsp.Body.Close()
			// 	})
			// })
		})

		Context("get aggregated metrics", func() {
			It("returns with apiserver response", func() {
				request, err := http.NewRequest(http.MethodGet, fmt.Sprintf("http://127.0.0.1:%d/v1/apps/an-app-id/aggregated_metric_histories/memoryused", uiPort), strings.NewReader(""))
				Expect(err).NotTo(HaveOccurred())
				request.Header.Add("Authorization", "the-token")
				rsp, err := httpClient.Do(request)
				Expect(err).NotTo(HaveOccurred())
				Expect(rsp.StatusCode).To(Equal(http.StatusOK))
				rsp.Body.Close()
			})
		})

		Context("get metrics", func() {
			It("returns with apiserver response", func() {
				request, err := http.NewRequest(http.MethodGet, fmt.Sprintf("http://127.0.0.1:%d/v1/apps/an-app-id/metric_histories/memoryused", uiPort), strings.NewReader(""))
				Expect(err).NotTo(HaveOccurred())
				request.Header.Add("Authorization", "the-token")
				rsp, err := httpClient.Do(request)
				Expect(err).NotTo(HaveOccurred())
				Expect(rsp.StatusCode).To(Equal(http.StatusOK))
				rsp.Body.Close()
			})
		})

		Context("get scalinghistory", func() {
			It("returns with apiserver response", func() {
				request, err := http.NewRequest(http.MethodGet, fmt.Sprintf("http://127.0.0.1:%d/v1/apps/an-app-id/scaling_histories", uiPort), strings.NewReader(""))
				Expect(err).NotTo(HaveOccurred())
				request.Header.Add("Authorization", "the-token")
				rsp, err := httpClient.Do(request)
				Expect(err).NotTo(HaveOccurred())
				Expect(rsp.StatusCode).To(Equal(http.StatusOK))
				rsp.Body.Close()
			})
		})

		Context("get policy", func() {
			It("returns with apiserver response", func() {
				request, err := http.NewRequest(http.MethodGet, fmt.Sprintf("http://127.0.0.1:%d/v1/apps/an-app-id/policy", uiPort), strings.NewReader("policy-content"))
				Expect(err).NotTo(HaveOccurred())
				request.Header.Add("Authorization", "the-token")
				rsp, err := httpClient.Do(request)
				Expect(err).NotTo(HaveOccurred())
				Expect(rsp.StatusCode).To(Equal(http.StatusOK))
				rsp.Body.Close()
			})
		})

		Context("update policy", func() {
			It("returns with apiserver response", func() {
				request, err := http.NewRequest(http.MethodPut, fmt.Sprintf("http://127.0.0.1:%d/v1/apps/an-app-id/policy", uiPort), strings.NewReader("policy-content"))
				Expect(err).NotTo(HaveOccurred())
				request.Header.Add("Authorization", "the-token")
				rsp, err := httpClient.Do(request)
				Expect(err).NotTo(HaveOccurred())
				Expect(rsp.StatusCode).To(Equal(http.StatusOK))
				rsp.Body.Close()
			})
		})

		Context("delete policy", func() {
			It("returns with apiserver response", func() {
				request, err := http.NewRequest(http.MethodDelete, fmt.Sprintf("http://127.0.0.1:%d/v1/apps/an-app-id/policy", uiPort), strings.NewReader("policy-content"))
				Expect(err).NotTo(HaveOccurred())
				request.Header.Add("Authorization", "the-token")
				rsp, err := httpClient.Do(request)
				Expect(err).NotTo(HaveOccurred())
				Expect(rsp.StatusCode).To(Equal(http.StatusOK))
				rsp.Body.Close()
			})
		})

		Context("notfound handler", func() {
			It("returns 404", func() {
				request, err := http.NewRequest(http.MethodGet, fmt.Sprintf("http://127.0.0.1:%d/wrong-path", uiPort), strings.NewReader(""))
				Expect(err).NotTo(HaveOccurred())
				request.Header.Add("Authorization", "the-token")
				rsp, err := httpClient.Do(request)
				Expect(err).NotTo(HaveOccurred())
				Expect(rsp.StatusCode).To(Equal(http.StatusNotFound))
				rsp.Body.Close()
			})
		})

	})
})
