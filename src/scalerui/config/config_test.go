package config_test

import (
	"bytes"
	"os"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	. "scalerui/config"
	"scalerui/models"
)

var _ = Describe("Config", func() {

	var (
		conf        *Config
		err         error
		configBytes []byte
	)
	Context("LoadConfig", func() {
		JustBeforeEach(func() {
			conf, err = LoadConfig(bytes.NewReader(configBytes))
		})

		Context("with invalid yaml", func() {
			BeforeEach(func() {
				configBytes = []byte(`
server:
port: 8080
  view_path: "scalerui/view/dev"
logging:
  level: debug
api_server:
  url: https://autoscaler.bosh-lite.com
		`)
			})
			It("returns an error", func() {
				Expect(err).To(MatchError(MatchRegexp("yaml: .*")))
			})
		})

		Context("with valid yaml", func() {
			BeforeEach(func() {
				configBytes = []byte(`
server:
  port: 8080
  view_path: "scalerui/view/dev"
  session_timeout: 800s
  session_refresh_interval: 80s
  enable_csrf_prevention: true
  enable_clickjacking_prevention: true
  enable_sso_prevention: true
  enable_https_redirection: true
  console_url: https://console.bosh-lite.com
  tls:
    key_file: server.key
    cert_file: server.crt
    ca_file: ca.crt
logging:
  level: debug
  files:
  - "scalerui.log1"
  - "scalerui.log2"
  - 111
api_server:
  url: https://autoscaler.bosh-lite.com
  tls:
    key_file: apiserver.key
    cert_file: apiserver.crt
    ca_file: apica.crt
cf:
  api: https://api.bosh-lite.com
  client:
    client_id: test-client-id
    client_secret: test-client-secret
    scope: test-client-scope
`)
			})
			It("returns the config", func() {
				Expect(err).NotTo(HaveOccurred())
				Expect(conf.Server.Port).To(Equal(8080))
				Expect(conf.Server.ViewPath).To(Equal("scalerui/view/dev"))
				Expect(conf.Server.SessionTimeout).To(Equal(time.Second * 800))
				Expect(conf.Server.SessionRefreshInterval).To(Equal(time.Second * 80))
				Expect(conf.Server.EnableCSRFPrevention).To(BeTrue())
				Expect(conf.Server.EnableClickJackingPrevention).To(BeTrue())
				Expect(conf.Server.EnableSSOPrevention).To(BeTrue())
				Expect(conf.Server.EnableHTTPSRedirection).To(BeTrue())
				Expect(conf.Server.ConsoleURL).To(Equal("https://console.bosh-lite.com"))
				Expect(conf.Server.TLS.CertFile).To(Equal("server.crt"))
				Expect(conf.Server.TLS.KeyFile).To(Equal("server.key"))
				Expect(conf.Server.TLS.CACertFile).To(Equal("ca.crt"))
				Expect(conf.Logging.Level).To(Equal("debug"))
				Expect(conf.Logging.FilePaths).To(Equal([]string{"scalerui.log1", "scalerui.log2", "111"}))
				Expect(conf.ApiServer.Url).To(Equal("https://autoscaler.bosh-lite.com"))
				Expect(conf.ApiServer.TLSClientCerts.CertFile).To(Equal("apiserver.crt"))
				Expect(conf.ApiServer.TLSClientCerts.KeyFile).To(Equal("apiserver.key"))
				Expect(conf.ApiServer.TLSClientCerts.CACertFile).To(Equal("apica.crt"))

				Expect(conf.Cf.Api).To(Equal("https://api.bosh-lite.com"))

				Expect(conf.Cf.Client.ClientId).To(Equal("test-client-id"))
				Expect(conf.Cf.Client.ClientSecret).To(Equal("test-client-secret"))
				Expect(conf.Cf.Client.Scope).To(Equal("test-client-scope"))

			})

			Context("when configurations defined in env", func() {

				BeforeEach(func() {
					os.Setenv("PORT", "8888")
					os.Setenv("VIEW_PATH", "another-scalerui/view/dev")
					os.Setenv("SESSION_TIMEOUT", "888s")
					os.Setenv("SESSION_REFRESH_INTERVAL", "888s")
					os.Setenv("ENABLE_CSRF_PREVENTION", "false")
					os.Setenv("ENABLE_CLICKJACKING_PREVENTION", "false")
					os.Setenv("ENABLE_SSO_PREVENTION", "false")
					os.Setenv("ENABLE_HTTPS_REDIRETION", "false")
					os.Setenv("CONSOLE_URL", "https://another_console.bosh-lite.com")
					os.Setenv("LOG_LEVEL", "error")
					os.Setenv("API_SERVER_URL", "https://another_autoscaler.bosh-lite.com")
					os.Setenv("CF_API_ENDPOINT", "https://another_api.bosh-lite.com")
					os.Setenv("CF_CLIENT_ID", "another-test-client-id")
					os.Setenv("CF_CLIENT_SECRET", "another-test-client-secret")
					os.Setenv("CF_CLIENT_SCOPE", "another-test-client-scope")

				})
				AfterEach(func() {

					os.Unsetenv("PORT")
					os.Unsetenv("VIEW_PATH")
					os.Unsetenv("SESSION_TIMEOUT")
					os.Unsetenv("SESSION_REFRESH_INTERVAL")
					os.Unsetenv("ENABLE_CSRF_PREVENTION")
					os.Unsetenv("ENABLE_CLICKJACKING_PREVENTION")
					os.Unsetenv("ENABLE_SSO_PREVENTION")
					os.Unsetenv("ENABLE_HTTPS_REDIRETION")
					os.Unsetenv("CONSOLE_URL")
					os.Unsetenv("LOG_LEVEL")
					os.Unsetenv("API_SERVER_URL")
					os.Unsetenv("CF_API_ENDPOINT")
					os.Unsetenv("CF_CLIENT_ID")
					os.Unsetenv("CF_CLIENT_SECRET")
					os.Unsetenv("CF_CLIENT_SCOPE")
				})
				It("env configurations will override configuration file", func() {
					Expect(err).NotTo(HaveOccurred())
					Expect(conf.Server.Port).To(Equal(8888))
					Expect(conf.Server.ViewPath).To(Equal("another-scalerui/view/dev"))
					Expect(conf.Server.SessionTimeout).To(Equal(time.Second * 888))
					Expect(conf.Server.SessionRefreshInterval).To(Equal(time.Second * 888))
					Expect(conf.Server.EnableCSRFPrevention).To(BeFalse())
					Expect(conf.Server.EnableClickJackingPrevention).To(BeFalse())
					Expect(conf.Server.EnableSSOPrevention).To(BeFalse())
					Expect(conf.Server.EnableHTTPSRedirection).To(BeFalse())
					Expect(conf.Server.ConsoleURL).To(Equal("https://another_console.bosh-lite.com"))
					Expect(conf.Server.TLS.CertFile).To(Equal("server.crt"))
					Expect(conf.Server.TLS.KeyFile).To(Equal("server.key"))
					Expect(conf.Server.TLS.CACertFile).To(Equal("ca.crt"))
					Expect(conf.Logging.Level).To(Equal("error"))
					Expect(conf.ApiServer.Url).To(Equal("https://another_autoscaler.bosh-lite.com"))
					Expect(conf.ApiServer.TLSClientCerts.CertFile).To(Equal("apiserver.crt"))
					Expect(conf.ApiServer.TLSClientCerts.KeyFile).To(Equal("apiserver.key"))
					Expect(conf.ApiServer.TLSClientCerts.CACertFile).To(Equal("apica.crt"))

					Expect(conf.Cf.Api).To(Equal("https://another_api.bosh-lite.com"))

					Expect(conf.Cf.Client.ClientId).To(Equal("another-test-client-id"))
					Expect(conf.Cf.Client.ClientSecret).To(Equal("another-test-client-secret"))
					Expect(conf.Cf.Client.Scope).To(Equal("another-test-client-scope"))

				})
			})
		})

		Context("with partial config", func() {
			BeforeEach(func() {
				configBytes = []byte(`
server:
  view_path: "scalerui/view/dev"
  console_url: https://console.bosh-lite.com
  tls:
    key_file: server.key
    cert_file: server.crt
    ca_file: ca.crt
api_server:
  url: https://autoscaler.bosh-lite.com
  tls:
    key_file: apiserver.key
    cert_file: apiserver.crt
    ca_file: apica.crt
cf:
  api: https://api.bosh-lite.com
  client:
    client_id: test-client-id
    client_secret: test-client-secret
    scope: test-client-scope
`)
			})
			It("returns default values", func() {
				Expect(err).NotTo(HaveOccurred())
				Expect(conf.Server.Port).To(Equal(8080))
				Expect(conf.Server.ViewPath).To(Equal("scalerui/view/dev"))
				Expect(conf.Server.SessionTimeout).To(Equal(time.Second * 600))
				Expect(conf.Server.SessionRefreshInterval).To(Equal(time.Second * 60))
				Expect(conf.Server.EnableCSRFPrevention).To(BeTrue())
				Expect(conf.Server.ConsoleURL).To(Equal("https://console.bosh-lite.com"))
				Expect(conf.Server.TLS.CertFile).To(Equal("server.crt"))
				Expect(conf.Server.TLS.KeyFile).To(Equal("server.key"))
				Expect(conf.Server.TLS.CACertFile).To(Equal("ca.crt"))
				Expect(conf.Logging.Level).To(Equal("info"))
				Expect(conf.Logging.FilePaths).To(BeEmpty())
				Expect(conf.ApiServer.Url).To(Equal("https://autoscaler.bosh-lite.com"))
				Expect(conf.ApiServer.TLSClientCerts.CertFile).To(Equal("apiserver.crt"))
				Expect(conf.ApiServer.TLSClientCerts.KeyFile).To(Equal("apiserver.key"))
				Expect(conf.ApiServer.TLSClientCerts.CACertFile).To(Equal("apica.crt"))

				Expect(conf.Cf.Api).To(Equal("https://api.bosh-lite.com"))
				Expect(conf.Cf.Client.ClientId).To(Equal("test-client-id"))
				Expect(conf.Cf.Client.ClientSecret).To(Equal("test-client-secret"))
				Expect(conf.Cf.Client.Scope).To(Equal("test-client-scope"))

			})
		})
	})

	Context("Validate", func() {
		BeforeEach(func() {
			conf = &Config{
				Server: ServerConfig{
					Port: 8080,
					TLS: models.TLSCerts{
						KeyFile:    "server.crt",
						CertFile:   "server.key",
						CACertFile: "ca.crt",
					},
					ViewPath:   "view_path",
					ConsoleURL: "https://autoscaler.bosh-lite.com",
				},
				Logging: LoggingConfig{
					Level: "info",
				},
				ApiServer: ApiServerConfig{
					Url: "https://autoscaler.bosh-lite.com",
					TLSClientCerts: models.TLSCerts{
						KeyFile:    "apiserver.crt",
						CertFile:   "apiserver.key",
						CACertFile: "apica.crt",
					},
				},
				Cf: CfConfig{
					Api: "https://api.bosh-lite.com",
					Client: CfClientConfig{
						ClientId:     "test-client-id",
						ClientSecret: "test-client-secret",
						Scope:        "test-client-scope",
					},
				},
			}
		})

		JustBeforeEach(func() {
			err = conf.Validate()
		})
		Context("when all the configs are valid", func() {
			It("should not error", func() {
				Expect(err).NotTo(HaveOccurred())
			})
		})
		Context("when view url is not set", func() {
			BeforeEach(func() {
				conf.Server.ViewPath = ""
			})

			It("should error", func() {
				Expect(err).To(MatchError(MatchRegexp("Configuration error: View path is empty")))
			})
		})

		Context("when console url is not set", func() {
			BeforeEach(func() {
				conf.Server.ConsoleURL = ""
			})

			It("should error", func() {
				Expect(err).To(MatchError(MatchRegexp("Configuration error: ConsoleURL is empty")))
			})
		})

		Context("when api server url is not set", func() {
			BeforeEach(func() {
				conf.ApiServer.Url = ""
			})

			It("should error", func() {
				Expect(err).To(MatchError(MatchRegexp("Configuration error: Api server url is empty")))
			})
		})

		Context("when cf api is not set", func() {
			BeforeEach(func() {
				conf.Cf.Api = ""
			})

			It("should error", func() {
				Expect(err).To(MatchError(MatchRegexp("Configuration error: Cf api is empty")))
			})
		})

		Context("when cf client_id is not set", func() {
			BeforeEach(func() {
				conf.Cf.Client.ClientId = ""
			})

			It("should error", func() {
				Expect(err).To(MatchError(MatchRegexp("Configuration error: Cf client_id is empty")))
			})
		})

		Context("when cf client_secret is not set", func() {
			BeforeEach(func() {
				conf.Cf.Client.ClientSecret = ""
			})

			It("should error", func() {
				Expect(err).To(MatchError(MatchRegexp("Configuration error: Cf client_secret is empty")))
			})
		})

		Context("when cf client scope is not set", func() {
			BeforeEach(func() {
				conf.Cf.Client.Scope = ""
			})

			It("should error", func() {
				Expect(err).To(MatchError(MatchRegexp("Configuration error: Cf client scope is empty")))
			})
		})
	})

})
