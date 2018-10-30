package config

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
	"time"

	"gopkg.in/yaml.v2"

	"scalerui/models"
)

const (
	DefaultLoggingLevel = "info"
)

type ServerConfig struct {
	Port                         int             `yaml:"port"`
	TLS                          models.TLSCerts `yaml:"tls"`
	ViewPath                     string          `yaml:"view_path"`
	SessionTimeout               time.Duration   `yaml:"session_timeout"`
	SessionRefreshInterval       time.Duration   `yaml:"session_refresh_interval"`
	EnableCSRFPrevention         bool            `yaml:"enable_csrf_prevention"`
	EnableClickJackingPrevention bool            `yaml:"enable_clickjacking_prevention"`
	EnableSSOPrevention          bool            `yaml:"enable_sso_prevention"`
	EnableHTTPSRedirection       bool            `yaml:"enable_https_redirection"`
	ConsoleURL                   string          `yaml:"console_url"`
}

var defaultServerConfig = ServerConfig{
	Port:                         8080,
	SessionTimeout:               600 * time.Second,
	SessionRefreshInterval:       60 * time.Second,
	EnableCSRFPrevention:         true,
	EnableClickJackingPrevention: true,
	EnableSSOPrevention:          true,
	EnableHTTPSRedirection:       true,
}

type LoggingConfig struct {
	Level     string   `yaml:"level"`
	FilePaths []string `yaml:"files"`
}

var defaultLoggingConfig = LoggingConfig{
	Level: DefaultLoggingLevel,
}

type ApiServerConfig struct {
	Url            string          `yaml:"url"`
	TLSClientCerts models.TLSCerts `yaml:"tls"`
}
type CfClientConfig struct {
	ClientId     string `yaml:"client_id"`
	ClientSecret string `yaml:"client_secret"`
	Scope        string `yaml:"scope"`
}
type CfConfig struct {
	Api    string         `yaml:"api"`
	Client CfClientConfig `yaml:"client"`
}
type Config struct {
	Logging   LoggingConfig   `yaml:"logging"`
	Server    ServerConfig    `yaml:"server"`
	ApiServer ApiServerConfig `yaml:"api_server"`
	Cf        CfConfig        `yaml:"cf"`
}

func LoadConfig(reader io.Reader) (*Config, error) {
	conf := &Config{
		Logging: defaultLoggingConfig,
		Server:  defaultServerConfig,
	}

	bytes, err := ioutil.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	err = yaml.Unmarshal(bytes, conf)
	if err != nil {
		return nil, err
	}

	conf.Logging.Level = strings.ToLower(conf.Logging.Level)

	//env values override configuration file
	if port := readConfigurationFromEnv("PORT"); port != "" {
		portInt64, err := strconv.ParseInt(port, 10, 64)
		if err == nil {
			conf.Server.Port = int(portInt64)
		}

	}
	if viewPath := readConfigurationFromEnv("VIEW_PATH"); viewPath != "" {
		conf.Server.ViewPath = viewPath
	}
	if sessionTimeout := readConfigurationFromEnv("SESSION_TIMEOUT"); sessionTimeout != "" {
		sessionTimeoutDuration, err := time.ParseDuration(sessionTimeout)
		// if err != nil {
		// 	panic(fmt.Sprintf("invalid SESSION_TIMEOUT: %s", sessionTimeout))
		// }
		if err == nil {
			conf.Server.SessionTimeout = sessionTimeoutDuration

		}
	}
	if sessionRefreshInterval := readConfigurationFromEnv("SESSION_REFRESH_INTERVAL"); sessionRefreshInterval != "" {
		sessionRefreshIntervalDuration, err := time.ParseDuration(sessionRefreshInterval)
		// if err != nil {
		// 	panic(fmt.Sprintf("invalid SESSION_REFRESH_INTERVAL: %s", sessionRefreshInterval))
		// }
		if err == nil {
			conf.Server.SessionRefreshInterval = sessionRefreshIntervalDuration
		}
	}

	if enableCSRFPrevention := readConfigurationFromEnv("ENABLE_CSRF_PREVENTION"); enableCSRFPrevention != "" {
		enableCSRFPreventionBool, err := strconv.ParseBool(enableCSRFPrevention)
		// if err != nil {
		// 	panic(fmt.Sprintf("invalid ENABLE_CSRF_PREVENTION: %s", enableCSRFPrevention))
		// }
		if err == nil {
			conf.Server.EnableCSRFPrevention = enableCSRFPreventionBool
		}
	}

	if enableClickJackingPrevention := readConfigurationFromEnv("ENABLE_CLICKJACKING_PREVENTION"); enableClickJackingPrevention != "" {
		enableClickJackingPreventionBool, err := strconv.ParseBool(enableClickJackingPrevention)
		// if err != nil {
		// 	panic(fmt.Sprintf("invalid ENABLE_CLICKJACKING_PREVENTION: %s", enableClickJackingPrevention))
		// }
		if err == nil {
			conf.Server.EnableClickJackingPrevention = enableClickJackingPreventionBool
		}
	}

	if enableSSOPrevention := readConfigurationFromEnv("ENABLE_SSO_PREVENTION"); enableSSOPrevention != "" {
		enableSSOPreventionBool, err := strconv.ParseBool(enableSSOPrevention)
		// if err != nil {
		// 	panic(fmt.Sprintf("invalid ENABLE_SSO_PREVENTION: %s", enableSSOPrevention))
		// }
		if err == nil {
			conf.Server.EnableSSOPrevention = enableSSOPreventionBool
		}
	}

	if enableHTTPSRedirection := readConfigurationFromEnv("ENABLE_HTTPS_REDIRETION"); enableHTTPSRedirection != "" {
		enableHTTPSRedirectionBool, err := strconv.ParseBool(enableHTTPSRedirection)
		// if err != nil {
		// 	panic(fmt.Sprintf("invalid ENABLE_HTTPS_REDIRETION: %s", enableHTTPSRedirection))
		// }
		if err == nil {
			conf.Server.EnableHTTPSRedirection = enableHTTPSRedirectionBool
		}
	}

	if consoleUrl := readConfigurationFromEnv("CONSOLE_URL"); consoleUrl != "" {
		conf.Server.ConsoleURL = consoleUrl
	}

	if logLevel := readConfigurationFromEnv("LOG_LEVEL"); logLevel != "" {
		conf.Logging.Level = strings.ToLower(logLevel)
	}

	if apiServerUrl := readConfigurationFromEnv("API_SERVER_URL"); apiServerUrl != "" {
		conf.ApiServer.Url = apiServerUrl
	}

	if cfApi := readConfigurationFromEnv("CF_API_ENDPOINT"); cfApi != "" {
		conf.Cf.Api = cfApi
	}

	if cfClientId := readConfigurationFromEnv("CF_CLIENT_ID"); cfClientId != "" {
		conf.Cf.Client.ClientId = cfClientId
	}

	if cfClientSecret := readConfigurationFromEnv("CF_CLIENT_SECRET"); cfClientSecret != "" {
		conf.Cf.Client.ClientSecret = cfClientSecret
	}

	if cfClientScope := readConfigurationFromEnv("CF_CLIENT_SCOPE"); cfClientScope != "" {
		conf.Cf.Client.Scope = cfClientScope
	}

	return conf, nil
}

func (c *Config) Validate() error {

	if c.ApiServer.Url == "" {
		return fmt.Errorf("Configuration error: Api server url is empty")
	}
	if c.Server.ViewPath == "" {
		return fmt.Errorf("Configuration error: View path is empty")
	}
	if c.Server.ConsoleURL == "" {
		return fmt.Errorf("Configuration error: ConsoleURL is empty")
	}
	if c.Cf.Api == "" {
		return fmt.Errorf("Configuration error: Cf api is empty")
	}
	if c.Cf.Client.ClientId == "" {
		return fmt.Errorf("Configuration error: Cf client_id is empty")
	}
	if c.Cf.Client.ClientSecret == "" {
		return fmt.Errorf("Configuration error: Cf client_secret is empty")
	}
	if c.Cf.Client.Scope == "" {
		return fmt.Errorf("Configuration error: Cf client scope is empty")
	}

	return nil

}

func readConfigurationFromEnv(name string) string {
	return os.Getenv(name)
}
