package https

import (
	"scalerui/config"

	"code.cloudfoundry.org/lager"

	"net/http"
	"strings"
)

type HttpsRedirectionMiddleware struct {
	config *config.Config
	logger lager.Logger
}

func NewHttpsRedirectionMiddleware(logger lager.Logger, config *config.Config) *HttpsRedirectionMiddleware {
	return &HttpsRedirectionMiddleware{
		config: config,
		logger: logger.Session("HttpsRedirectionMiddleware"),
	}
}

func (hm *HttpsRedirectionMiddleware) HTTPSRedirect(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if proto := getProtocol(r); proto != "https" && !strings.Contains(r.Host, "localhost") && !strings.HasPrefix(r.RequestURI, "/healthcheck") {
			// not https
			u := "https://" + r.Host + r.RequestURI
			hm.logger.Info("Redirecting", lager.Data{"request_host": r.Host, "new_uri": u, "request_tls": r.TLS, "request_proto": proto})
			http.Redirect(w, r, u, http.StatusMovedPermanently)
		} else {
			next.ServeHTTP(w, r)
		}
	})
}

func getProtocol(req *http.Request) string {
	if req.TLS == nil {
		switch wssc := req.Header.Get("$wssc"); wssc {
		case "https":
			break
		case "":
			// See if we have X-Forwarded-Proto, this is the defacto standard for proxies.
			if xfp := req.Header.Get("X-Forwarded-Proto"); xfp == "https" {
				break
			}
			fallthrough
		default:
			return "http"
		}
	}
	return "https"
}
