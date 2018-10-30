package auth_test

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"regexp"

	"code.cloudfoundry.org/cfhttp"
	"code.cloudfoundry.org/lager"
	"code.cloudfoundry.org/lager/lagertest"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/onsi/gomega/gbytes"
	"github.com/onsi/gomega/ghttp"

	. "scalerui/auth"
	"scalerui/config"
	"scalerui/endpoints"
	"scalerui/models"
)

var _ = Describe("UaaHelper", func() {

	var (
		uaaHelper        *UAAHelper
		logger           *lagertest.TestLogger
		httpClient       *http.Client
		endpointsManager *endpoints.EndpointsManager
		conf             *config.Config
		code             string = "code"
		refreshToken     string = "refresh-token"

		ccApiFakeServer  *ghttp.Server
		uaaFakeServer    *ghttp.Server
		response         *httptest.ResponseRecorder = httptest.NewRecorder()
		request          *http.Request              = &http.Request{}
		ccStatus         int                        = http.StatusOK
		oauthTokenStatus int                        = http.StatusOK
		ccEndpoints      interface{}
		tokensResult     interface{}
	)
	BeforeEach(func() {
		response = httptest.NewRecorder()
		request = &http.Request{}
		ccApiFakeServer = ghttp.NewServer()
		uaaFakeServer = ghttp.NewServer()
		logger = lagertest.NewTestLogger("uaa_helper")
		logger.RegisterSink(lager.NewWriterSink(GinkgoWriter, lager.DEBUG))
		httpClient = cfhttp.NewClient()
		conf = &config.Config{
			Cf: config.CfConfig{
				Client: config.CfClientConfig{
					ClientId:     "test-client-id",
					ClientSecret: "test-client-secret",
					Scope:        "test-scope",
				},
				Api: ccApiFakeServer.URL(),
			},
		}
		ccEndpoints = models.CCEndpoints{
			AuthEndpoint: uaaFakeServer.URL(),
		}
		endpointsManager = endpoints.NewEndpointsManager(logger, conf, httpClient)
		uaaHelper = NewUAAHelper(logger, conf, httpClient, endpointsManager)
	})
	AfterEach(func() {
		ccApiFakeServer.Close()
		uaaFakeServer.Close()
	})
	JustBeforeEach(func() {
		apiPath, _ := regexp.Compile(".*v2/info.*")
		tokenPath, _ := regexp.Compile(".*/oauth/token.*")
		ccApiFakeServer.RouteToHandler(http.MethodGet, apiPath, ghttp.RespondWithJSONEncoded(ccStatus, ccEndpoints))
		uaaFakeServer.RouteToHandler(http.MethodPost, tokenPath, ghttp.RespondWith(oauthTokenStatus, tokensResult))
	})
	// Context("GetAuthorizationEndpoint", func() {
	// 	var authEndpoint string
	// 	var err error
	// 	JustBeforeEach(func() {
	// 		authEndpoint, err = uaaHelper.GetAuthorizationEndpoint(conf.Cf.Api)
	// 	})
	// 	Context("when failed to connection cc api", func() {
	// 		BeforeEach(func() {
	// 			ccApiFakeServer.Close()
	// 		})
	// 		It("returns error", func() {
	// 			Expect(authEndpoint).To(BeEmpty())
	// 			Eventually(logger.Buffer()).Should(gbytes.Say("connection refused"))
	// 		})
	// 	})

	// 	Context("when failed to unmarshal response body of cc api", func() {
	// 		BeforeEach(func() {
	// 			ccStatus = http.StatusOK
	// 			ccEndpoints = ""

	// 		})
	// 		It("returns error", func() {
	// 			Expect(authEndpoint).To(BeEmpty())
	// 			Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-unmarshal-endpoints-from-cc-response"))
	// 		})
	// 	})
	// 	Context("when successfully get endpoints from cc api", func() {
	// 		BeforeEach(func() {
	// 			ccStatus = http.StatusOK
	// 		})
	// 		It("returns AuthEndpoint", func() {
	// 			Expect(err).NotTo(HaveOccurred())
	// 			Expect(authEndpoint).To(Equal(uaaFakeServer.URL()))
	// 		})
	// 	})
	// })

	Context("RedirectToAuthEndpoint", func() {
		JustBeforeEach(func() {
			uaaHelper.RedirectToAuthEndpoint(response, request)
		})
		Context("when error occurs in GetAuthorizationEndpoint", func() {
			BeforeEach(func() {
				ccApiFakeServer.Close()
			})
			It("should return error", func() {
				Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-AuthorizationEndpoint"))

				Expect(response.Code).To(Equal(http.StatusInternalServerError))
				errJson := &models.ErrorResponse{}
				err := json.Unmarshal(response.Body.Bytes(), errJson)

				Expect(err).ToNot(HaveOccurred())
				Expect(errJson).To(Equal(&models.ErrorResponse{
					Code:        "Internal-Server-Error",
					Description: "Error doing SSO check",
				}))
			})
		})
		Context("redirect to target url", func() {
			BeforeEach(func() {
				request, _ = http.NewRequest(http.MethodGet, fmt.Sprintf("%s%s", uaaFakeServer.URL(), "/test?key=value"), nil)
			})
			It("redirect to target url", func() {
				Expect(response.Code).To(Equal(http.StatusFound))
			})
		})
	})

	Context("GetUAATokenWithAuthorizationCode", func() {
		var (
			tokens *models.UAAToken
			err    error
		)
		JustBeforeEach(func() {
			tokens, err = uaaHelper.GetUAATokenWithAuthorizationCode(code, conf.Cf.Client.ClientId, conf.Cf.Client.ClientSecret, "redirectUrl")
		})
		Context("when error occurs in GetAuthorizationEndpoint", func() {
			BeforeEach(func() {
				ccApiFakeServer.Close()
			})
			It("log the error", func() {
				Expect(tokens).To(BeNil())
				Expect(err).Should(HaveOccurred())
				Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-AuthorizationEndpoint"))
			})
		})
		Context("when error occurs in communicating to AuthorizationEndpoint", func() {
			BeforeEach(func() {
				uaaFakeServer.Close()
			})
			It("shoul return error", func() {
				Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-from-token-point-connection-error"))
				Eventually(logger.Buffer()).Should(gbytes.Say("connection refused"))
				Expect(tokens).To(BeNil())
				Expect(err).Should(HaveOccurred())
			})
		})

		Context("when AuthorizationEndpoint returns 401", func() {
			BeforeEach(func() {
				oauthTokenStatus = http.StatusUnauthorized
			})
			It("shoul return error", func() {
				Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-from-token-point-unauthorized"))
				Expect(tokens).To(BeNil())
				Expect(err).Should(HaveOccurred())
			})
		})

		Context("when AuthorizationEndpoint returns 500", func() {
			BeforeEach(func() {
				oauthTokenStatus = http.StatusInternalServerError
			})
			It("shoul return error", func() {
				Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-from-token-point-response-error"))
				Expect(tokens).To(BeNil())
				Expect(err).Should(HaveOccurred())
			})
		})
		Context("when AuthorizationEndpoint returns 200", func() {
			BeforeEach(func() {
				oauthTokenStatus = http.StatusOK
			})
			Context("when failed to unmarshal response", func() {
				BeforeEach(func() {
					tokensResult = "invalid-json-format-response"
				})
				It("shoul return error", func() {
					Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-failed-to-unmarshal-response"))
					Expect(tokens).To(BeNil())
					Expect(err).Should(HaveOccurred())
				})
			})

			Context("when access token is not invalid jwt format", func() {
				BeforeEach(func() {
					tokensResult = "{\"access_token\":\"invalid-jwt-token\",\"refresh_token\":\"token\"}"
				})
				It("shoul return error", func() {
					Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-invalid-token-format"))
					Expect(tokens).To(BeNil())
					Expect(err).To(Equal(errors.New("Token was poorly formed.")))
				})
			})

			Context("when access token is not invalid base64 encoded", func() {
				BeforeEach(func() {
					tokensResult = "{\"access_token\":\"invalid-base64.invalid-base64.invalid-base64\",\"refresh_token\":\"token\"}"
				})
				It("shoul return error", func() {
					Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-invalid-token-format"))
					Expect(tokens).To(BeNil())
					Expect(err).To(Equal(errors.New("Unable to decode token string.")))
				})
			})

			// Context("when failed to unmarshal access token after base64 decoded", func() {
			// 	BeforeEach(func() {
			// 		base64Str := base64.StdEncoding.EncodeToString([]byte("invalid-base64.invalid-base64.invalid-base64"))
			// 		tokensResult = "{\"access_token\":\"prefix." + base64Str + ".suffix\",\"refresh_token\":\"token\"}"
			// 	})
			// 	It("shoul return error", func() {
			// 		Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-invalid-token-format"))
			// 		Expect(tokens).To(BeNil())
			// 		Expect(err).To(Equal(errors.New("Unable to decode token string.")))
			// 	})
			// })

			Context("when failed to unmarshal info part of access token after base64 decoded", func() {
				BeforeEach(func() {
					base64Str := base64.RawStdEncoding.EncodeToString([]byte("invalid-access-token"))
					tokensResult = "{\"access_token\":\"prefix." + base64Str + ".suffix\",\"refresh_token\":\"token\"}"
				})
				It("shoul return error", func() {
					Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-invalid-token-format"))
					Expect(tokens).To(BeNil())
					Expect(err).To(Equal(errors.New("Failed to unmarshall decoded token.")))
				})
			})

			Context("when AuthorizationEndpoint returns valid token", func() {
				BeforeEach(func() {
					tokensResult = "{\"access_token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c\",\"refresh_token\":\"token\"}"
				})
				It("should return token", func() {
					var tokenRes models.UAAToken
					json.Unmarshal([]byte(tokensResult.(string)), &tokenRes)
					Expect(tokenRes).To(Equal(*tokens))
					Expect(err).NotTo(HaveOccurred())
				})
			})

		})
	})

	Context("GetUAATokenWithRefreshToken", func() {
		var (
			tokens *models.UAAToken
			err    error
		)
		JustBeforeEach(func() {
			tokens, err = uaaHelper.GetUAATokenWithRefreshToken(refreshToken, conf.Cf.Client.ClientId, conf.Cf.Client.ClientSecret)
		})
		Context("when error occurs in GetAuthorizationEndpoint", func() {
			BeforeEach(func() {
				ccApiFakeServer.Close()
			})
			It("log the error", func() {
				Expect(tokens).To(BeNil())
				Expect(err).Should(HaveOccurred())
				Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-AuthorizationEndpoint"))
			})
		})
		Context("when error occurs in communicating to AuthorizationEndpoint", func() {
			BeforeEach(func() {
				uaaFakeServer.Close()
			})
			It("shoul return error", func() {
				Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-from-token-point-connection-error"))
				Eventually(logger.Buffer()).Should(gbytes.Say("connection refused"))
				Expect(tokens).To(BeNil())
				Expect(err).Should(HaveOccurred())
			})
		})

		Context("when AuthorizationEndpoint returns 401", func() {
			BeforeEach(func() {
				oauthTokenStatus = http.StatusUnauthorized
			})
			It("shoul return error", func() {
				Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-from-token-point-unauthorized"))
				Expect(tokens).To(BeNil())
				Expect(err).Should(HaveOccurred())
			})
		})

		Context("when AuthorizationEndpoint returns 500", func() {
			BeforeEach(func() {
				oauthTokenStatus = http.StatusInternalServerError
			})
			It("shoul return error", func() {
				Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-from-token-point-response-error"))
				Expect(tokens).To(BeNil())
				Expect(err).Should(HaveOccurred())
			})
		})
		Context("when AuthorizationEndpoint returns 200", func() {
			BeforeEach(func() {
				oauthTokenStatus = http.StatusOK
			})
			Context("when failed to unmarshal response", func() {
				BeforeEach(func() {
					tokensResult = "invalid-json-format-response"
				})
				It("shoul return error", func() {
					Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-failed-to-unmarshal-response"))
					Expect(tokens).To(BeNil())
					Expect(err).Should(HaveOccurred())
				})
			})

			Context("when access token is not invalid jwt format", func() {
				BeforeEach(func() {
					tokensResult = "{\"access_token\":\"invalid-jwt-token\",\"refresh_token\":\"token\"}"
				})
				It("shoul return error", func() {
					Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-invalid-token-format"))
					Expect(tokens).To(BeNil())
					Expect(err).To(Equal(errors.New("Token was poorly formed.")))
				})
			})

			Context("when access token is not invalid base64 encoded", func() {
				BeforeEach(func() {
					tokensResult = "{\"access_token\":\"invalid-base64.invalid-base64.invalid-base64\",\"refresh_token\":\"token\"}"
				})
				It("shoul return error", func() {
					Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-invalid-token-format"))
					Expect(tokens).To(BeNil())
					Expect(err).To(Equal(errors.New("Unable to decode token string.")))
				})
			})

			// Context("when failed to unmarshal access token after base64 decoded", func() {
			// 	BeforeEach(func() {
			// 		base64Str := base64.StdEncoding.EncodeToString([]byte("invalid-base64.invalid-base64.invalid-base64"))
			// 		tokensResult = "{\"access_token\":\"prefix." + base64Str + ".suffix\",\"refresh_token\":\"token\"}"
			// 	})
			// 	It("shoul return error", func() {
			// 		Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-invalid-token-format"))
			// 		Expect(tokens).To(BeNil())
			// 		Expect(err).To(Equal(errors.New("Unable to decode token string.")))
			// 	})
			// })

			Context("when failed to unmarshal access token after base64 decoded", func() {
				BeforeEach(func() {
					base64Str := base64.RawStdEncoding.EncodeToString([]byte("invalid-access-token"))
					tokensResult = "{\"access_token\":\"prefix." + base64Str + ".suffix\",\"refresh_token\":\"token\"}"
				})
				It("shoul return error", func() {
					Eventually(logger.Buffer()).Should(gbytes.Say("failed-to-get-token-invalid-token-format"))
					Expect(tokens).To(BeNil())
					Expect(err).To(Equal(errors.New("Failed to unmarshall decoded token.")))
				})
			})

			Context("when AuthorizationEndpoint returns valid token", func() {
				BeforeEach(func() {
					tokensResult = "{\"access_token\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c\",\"refresh_token\":\"token\"}"
				})
				It("should return token", func() {
					var tokenRes models.UAAToken
					json.Unmarshal([]byte(tokensResult.(string)), &tokenRes)
					Expect(tokenRes).To(Equal(*tokens))
					Expect(err).NotTo(HaveOccurred())
				})
			})

		})
	})

})
