package main_test

import (
	"crypto/tls"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"testing"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/onsi/gomega/gexec"
	"github.com/onsi/gomega/ghttp"
	"gopkg.in/yaml.v2"

	"scalerui/config"
	"scalerui/endpoints"
	"scalerui/models"
)

var (
	uiPath                          string
	cfg                             config.Config
	uiPort                          int
	configFile                      *os.File
	httpClient                      *http.Client
	fakeApiServer                   *ghttp.Server
	aggregatedMetricsHistoryRegPath = regexp.MustCompile(`^/v1/apps/.*/aggregated_metric_histories/.*$`)
	metricsHistoryRegPath           = regexp.MustCompile(`^/v1/apps/.*/metric_histories/.*$`)
	scalingHistoriesHistoryRegPath  = regexp.MustCompile(`^/v1/apps/.*/scaling_histories.*$`)
	policyRegPath                   = regexp.MustCompile(`^/v1/apps/.*/policy$`)
)

func TestScalerUi(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Scalerui Suite")
}

var _ = SynchronizedBeforeSuite(func() []byte {
	ui, err := gexec.Build("scalerui/cmd/ui", "-race")
	Expect(err).NotTo(HaveOccurred())
	return []byte(ui)
}, func(pathsByte []byte) {
	uiPath = string(pathsByte)
	fakeApiServer = ghttp.NewServer()
	uiPort = 9900 + GinkgoParallelNode()

	cfg = config.Config{
		Logging: config.LoggingConfig{
			Level: "debug",
		},
		Server: config.ServerConfig{
			Port:                         uiPort,
			ViewPath:                     "../../../../view/dev",
			SessionTimeout:               600 * time.Second,
			SessionRefreshInterval:       60 * time.Second,
			EnableCSRFPrevention:         false,
			EnableClickJackingPrevention: false,
			EnableSSOPrevention:          false,
			EnableHTTPSRedirection:       false,
			ConsoleURL:                   "https://console.bosh-lite.com",
		},
		ApiServer: config.ApiServerConfig{
			Url: fakeApiServer.URL(),
		},
		Cf: config.CfConfig{
			Api: fakeApiServer.URL(),
			Client: config.CfClientConfig{
				ClientId:     "test-client-id",
				ClientSecret: "test-client-secret",
				Scope:        "test-client-scope",
			},
		},
	}

	configFile = writeConfig(&cfg)
	httpClient = &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
})

var _ = SynchronizedAfterSuite(func() {
	os.Remove(configFile.Name())
}, func() {
	gexec.CleanupBuildArtifacts()
})

func writeConfig(c *config.Config) *os.File {
	cfg, err := ioutil.TempFile("", "ui")
	Expect(err).NotTo(HaveOccurred())
	defer cfg.Close()

	bytes, err := yaml.Marshal(c)
	Expect(err).NotTo(HaveOccurred())

	_, err = cfg.Write(bytes)
	Expect(err).NotTo(HaveOccurred())

	return cfg
}

type ScalerUiRunner struct {
	configPath string
	Session    *gexec.Session
}

func NewScalerUiRunner() *ScalerUiRunner {
	return &ScalerUiRunner{
		configPath: configFile.Name(),
	}
}

func (ui *ScalerUiRunner) Start() {
	uiSession, err := gexec.Start(exec.Command(
		uiPath,
		"-c",
		ui.configPath,
	),
		gexec.NewPrefixedWriter("\x1b[32m[o]\x1b[32m[ui]\x1b[0m ", GinkgoWriter),
		gexec.NewPrefixedWriter("\x1b[91m[e]\x1b[32m[ui]\x1b[0m ", GinkgoWriter),
	)
	Expect(err).NotTo(HaveOccurred())

	ui.Session = uiSession
}

func (ui *ScalerUiRunner) Interrupt() {
	if ui.Session != nil {
		ui.Session.Interrupt().Wait(5 * time.Second)
	}
}

func (ui *ScalerUiRunner) KillWithFire() {
	if ui.Session != nil {
		ui.Session.Kill().Wait(5 * time.Second)
	}
}

func fakeApiServerRest() {
	fakeApiServer.RouteToHandler(http.MethodGet, policyRegPath, ghttp.RespondWith(http.StatusOK, "policy-content"))
	fakeApiServer.RouteToHandler(http.MethodPut, policyRegPath, ghttp.RespondWith(http.StatusOK, "policy-content"))
	fakeApiServer.RouteToHandler(http.MethodDelete, policyRegPath, ghttp.RespondWith(http.StatusOK, "policy-content"))
	fakeApiServer.RouteToHandler(http.MethodGet, aggregatedMetricsHistoryRegPath, ghttp.RespondWith(http.StatusOK, "aggregated-metrics-content"))
	fakeApiServer.RouteToHandler(http.MethodGet, metricsHistoryRegPath, ghttp.RespondWith(http.StatusOK, "metrics-content"))
	fakeApiServer.RouteToHandler(http.MethodGet, scalingHistoriesHistoryRegPath, ghttp.RespondWith(http.StatusOK, "histories-content"))

	fakeApiServer.RouteToHandler(http.MethodGet, endpoints.CCEndpointPath, ghttp.RespondWithJSONEncoded(http.StatusOK, models.CCEndpoints{
		AuthEndpoint: fakeApiServer.URL() + endpoints.AuthorizationPath,
	}))
}
func getConfig(config config.Config) config.Config {
	return config
}
