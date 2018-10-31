package main

import (
	"crypto/tls"
	"flag"
	"fmt"
	"os"

	"net/http"
	"scalerui/config"
	"scalerui/helpers"
	"scalerui/server"

	"code.cloudfoundry.org/cfhttp"
	"github.com/tedsuo/ifrit"
	"github.com/tedsuo/ifrit/grouper"
	"github.com/tedsuo/ifrit/sigmon"
)

//
func main() {
	var path string
	flag.StringVar(&path, "c", "", "config file")
	flag.Parse()
	if path == "" {
		fmt.Fprintln(os.Stderr, "missing config file")
		os.Exit(1)
	}

	configFile, err := os.Open(path)
	if err != nil {
		fmt.Fprintf(os.Stdout, "failed to open config file '%s' : %s\n", path, err.Error())
		os.Exit(1)
	}

	var conf *config.Config
	conf, err = config.LoadConfig(configFile)
	if err != nil {
		fmt.Fprintf(os.Stdout, "failed to read config file '%s' : %s\n", path, err.Error())
		os.Exit(1)
	}
	configFile.Close()

	err = conf.Validate()
	if err != nil {
		fmt.Fprintf(os.Stdout, "failed to validate configuration : %s\n", err.Error())
		os.Exit(1)
	}
	err = validateViewPath(conf.Server.ViewPath)
	if err != nil {
		fmt.Fprintf(os.Stdout, "failed to validate view path : %s\n", err.Error())
		os.Exit(1)
	}
	logger := helpers.InitLoggerFromConfig(&conf.Logging, "scalerui")
	httpClient := cfhttp.NewClient()
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	httpClient.Transport = tr

	httpServer, err := server.NewServer(logger.Session("http_server"), conf, httpClient)
	if err != nil {
		logger.Error("failed to create http server", err)
		os.Exit(1)
	}

	members := grouper.Members{
		{"http_server", httpServer},
	}

	monitor := ifrit.Invoke(sigmon.New(grouper.NewOrdered(os.Interrupt, members)))

	logger.Info("started")

	err = <-monitor.Wait()
	if err != nil {
		logger.Error("exited-with-failure", err)
		os.Exit(1)
	}
	logger.Info("exited")
}

func validateViewPath(viewPath string) error {
	if _, err := os.Stat(viewPath); os.IsNotExist(err) {
		return err
	}
	return nil
}
