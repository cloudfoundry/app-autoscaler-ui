package clickjacking

import (
	"scalerui/config"

	"code.cloudfoundry.org/lager"

	"net/http"
	"strings"
)

type ClickjackingMiddleware struct {
	config *config.Config
	logger lager.Logger
}

func NewClickjackingMiddleware(logger lager.Logger, config *config.Config) *ClickjackingMiddleware {
	return &ClickjackingMiddleware{
		config: config,
		logger: logger.Session("ClickjackingMiddleware"),
	}
}

func (cm *ClickjackingMiddleware) Clickjacking(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Frame-Options", strings.Split(cm.config.Server.ConsoleURL, ",")[0])
		w.Header().Set("Content-Security-Policy", "frame-ancestors 'self' "+ strings.Replace(cm.config.Server.ConsoleURL, ",", " ", -1))
		next.ServeHTTP(w, r)
	})
}
