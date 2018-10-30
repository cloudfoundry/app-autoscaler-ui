package middleware

import (
	"scalerui/config"

	"code.cloudfoundry.org/lager"

	"net/http"
)

type GzipHeaderMiddleware struct {
	config *config.Config
	logger lager.Logger
}

func NewGzipHeaderMiddleware(logger lager.Logger, config *config.Config) *GzipHeaderMiddleware {
	return &GzipHeaderMiddleware{
		config: config,
		logger: logger.Session("GzipHeaderMiddleware"),
	}
}

func (gm *GzipHeaderMiddleware) SetGzipHeader(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Header.Add("Accept-Encoding", "gzip")
		next.ServeHTTP(w, r)
	})
}
