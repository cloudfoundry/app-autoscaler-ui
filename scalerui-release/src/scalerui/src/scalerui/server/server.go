package server

import (
	"compress/gzip"
	"fmt"
	"net/http"

	"scalerui/auth"
	"scalerui/clickjacking"
	"scalerui/config"
	"scalerui/endpoints"
	"scalerui/https"
	"scalerui/middleware"
	"scalerui/routes"
	"scalerui/session"

	"code.cloudfoundry.org/cfhttp"
	"code.cloudfoundry.org/lager"
	"github.com/gorilla/csrf"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/tedsuo/ifrit"
	"github.com/tedsuo/ifrit/http_server"
)

type VarsFunc func(w http.ResponseWriter, r *http.Request, vars map[string]string)

func (vh VarsFunc) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	vh(w, r, vars)
}

func NewServer(logger lager.Logger, conf *config.Config, httpClient *http.Client) (ifrit.Runner, error) {

	em := endpoints.NewEndpointsManager(logger, conf, httpClient)
	err := em.InitEndpointsManager()
	if err != nil {
		logger.Error("failed-to-init-endpoints-manager", err)
	}

	sm := session.NewSessionManager(conf.Server.SessionTimeout, conf.Server.SessionRefreshInterval)

	ih := NewIndexHandler(logger, conf, httpClient)
	amh := NewAggregatedMetricHandler(logger, conf, httpClient)
	mh := NewMetricHandler(logger, conf, httpClient)
	sh := NewScalingHistoryHandler(logger, conf, httpClient)
	ph := NewPolicyHandler(logger, conf, httpClient)
	uh := auth.NewUAAHelper(logger, conf, httpClient, em)
	ssom := auth.NewSSOMiddleware(logger, conf, httpClient, sm, uh, em)

	ssoh := auth.NewSSOCallbackHandler(logger, conf, httpClient, sm, uh)
	sah := NewServiceHandler(logger, conf, httpClient)
	pubh := NewPublicHandler(logger, conf, httpClient)
	cm := clickjacking.NewClickjackingMiddleware(logger, conf)
	hm := https.NewHttpsRedirectionMiddleware(logger, conf)
	gm := middleware.NewGzipHeaderMiddleware(logger, conf)
	nh := NewNotFoundHandler(logger)
	r := routes.ScalerUiRoutes()

	if conf.Server.EnableCSRFPrevention {
		r.Use(csrf.Protect([]byte("32-byte-long-auth-key"), csrf.Path("/"), csrf.Secure(false), csrf.HttpOnly(false)))
	}
	if conf.Server.EnableSSOPrevention {
		r.Use(ssom.SSOCheck)
	}
	if conf.Server.EnableClickJackingPrevention {
		r.Use(cm.Clickjacking)
	}
	if conf.Server.EnableHTTPSRedirection {
		r.Use(hm.HTTPSRedirect)
	}
	r.Use(gm.SetGzipHeader)
	r.NotFoundHandler = VarsFunc(nh.HandleNotFound)
	r.Get(routes.ServiceIndexGetRouteName).Handler(VarsFunc(ih.HandleIndex))
	r.Get(routes.AppIndexGetRouteName).Handler(VarsFunc(ih.HandleIndex))

	r.Get(routes.SSOCheckRouteName).Handler(VarsFunc(ssoh.SSOCallback))

	// r.PathPrefix("/").Handler(http.FileServer(http.Dir(conf.Server.ViewPath)))
	// r.PathPrefix("/js/").Handler(http.FileServer(http.Dir(conf.Server.ViewPath)))
	r.PathPrefix("/js/").Handler(handlers.CompressHandlerLevel(http.StripPrefix("/js/", http.FileServer(http.Dir(conf.Server.ViewPath))), gzip.DefaultCompression))

	r.Get(routes.GetAggregatedMetricHistoriesRouteName).Handler(VarsFunc(amh.GetAggregatedMetricHistories))
	r.Get(routes.GetMetricHistoriesRouteName).Handler(VarsFunc(mh.GetMetricHistories))
	r.Get(routes.GetScalingHistoriesRouteName).Handler(VarsFunc(sh.GetScalingHistories))

	r.Get(routes.GetPolicyRouteName).Handler(VarsFunc(ph.GetPolicy))
	r.Get(routes.UpdatePolicyRouteName).Handler(VarsFunc(ph.UpdatePolicy))
	r.Get(routes.DeletePolicyRouteName).Handler(VarsFunc(ph.DeletePolicy))

	r.Get(routes.ServiceApplicationsRouteName).Handler(VarsFunc(sah.GetApplications))

	r.Get(routes.GetPublicInfoRouteName).Handler(VarsFunc(pubh.GetInfo))
	r.Get(routes.GetPublicHealthCheckRouteName).Handler(VarsFunc(pubh.GetHealthCheck))

	addr := fmt.Sprintf("0.0.0.0:%d", conf.Server.Port)

	var runner ifrit.Runner
	if (conf.Server.TLS.KeyFile == "") || (conf.Server.TLS.CertFile == "") {
		logger.Info("http-server")
		runner = http_server.New(addr, r)
	} else {
		logger.Info("https-server")
		tlsConfig, err := cfhttp.NewTLSConfig(conf.Server.TLS.CertFile, conf.Server.TLS.KeyFile, conf.Server.TLS.CACertFile)
		if err != nil {
			logger.Error("failed-new-server-new-tls-config", err, lager.Data{"tls": conf.Server.TLS})
			return nil, err
		}
		runner = http_server.NewTLSServer(addr, r, tlsConfig)
	}

	logger.Info("http-server-created", lager.Data{"serverConfig": conf.Server})
	return runner, nil
}
