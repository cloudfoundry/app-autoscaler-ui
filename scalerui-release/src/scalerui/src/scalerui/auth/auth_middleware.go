package auth

import (
	"scalerui/config"
	"scalerui/endpoints"
	"scalerui/routes"
	"scalerui/session"

	"code.cloudfoundry.org/lager"
	"github.com/gorilla/sessions"

	"net/http"
	"strings"
)

type skipRoute struct {
	route   string
	methods map[string]bool // If set then skip, if not set then needs context. Key '*' means all methods.
}

var (
	allmethods = map[string]bool{"*": true}

	skipRoutes = []skipRoute{
		skipRoute{route: routes.SSOCheckPath, methods: allmethods},
		skipRoute{route: routes.PublicInfoPath, methods: allmethods},
		skipRoute{route: routes.PublicHealthCheckPath, methods: allmethods},
	}
)

func skip(r *http.Request) bool {
	for _, skip := range skipRoutes {
		if strings.HasPrefix(r.URL.Path, skip.route) && (skip.methods["*"] || skip.methods[r.Method]) {
			return true
		}
	}
	return false
}

type SSOMiddleware struct {
	config           *config.Config
	logger           lager.Logger
	httpClient       *http.Client
	sessionStore     *sessions.CookieStore
	sessionManager   session.SessionManager
	uaaHelper        *UAAHelper
	endpointsManager *endpoints.EndpointsManager
}

func NewSSOMiddleware(logger lager.Logger, config *config.Config, httpClient *http.Client, sessionManager session.SessionManager, uaaHelper *UAAHelper, endpointsManager *endpoints.EndpointsManager) *SSOMiddleware {
	return &SSOMiddleware{
		config:           config,
		logger:           logger.Session("SSOMiddleware"),
		httpClient:       httpClient,
		sessionManager:   sessionManager,
		uaaHelper:        uaaHelper,
		endpointsManager: endpointsManager,
	}
}

func (h *SSOMiddleware) SSOCheck(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h.logger.Debug("sso-middleware-request-url", lager.Data{"url": r.RequestURI, "param": r.URL.Query().Encode(), "cookies": r.Cookies()})
		if skip(r) {
			next.ServeHTTP(w, r)
			return
		}
		h.logger.Debug("doing-sso-check", lager.Data{"requestUrl": r.RequestURI, "params": r.URL.Query()})
		if uaaToken := h.sessionManager.GetUAAToken(r); uaaToken != nil {
			if uaaToken.IsExpired() {
				h.logger.Info("access-token-expired-refresh-token")
				uaaToken, err := h.uaaHelper.GetUAATokenWithRefreshToken(uaaToken.RefreshToken, h.config.Cf.Client.ClientId, h.config.Cf.Client.ClientSecret)
				if err != nil {
					h.logger.Error("failed-to-refresh-token,redirect-to-oauth-process", err, lager.Data{"requestUrl": r.RequestURI, "params": r.URL.Query()})
				} else {
					h.sessionManager.SetUAAToken(w, r, uaaToken)
					r.Header.Add("Authorization", "bearer "+uaaToken.AccessToken)
					h.logger.Debug("add-new-token-to-session-and-request-from-refresh", lager.Data{"requestUrl": r.RequestURI, "params": r.URL.Query()})
				}
			} else {
				r.Header.Add("Authorization", "bearer "+uaaToken.AccessToken)
				h.logger.Debug("session-exists", lager.Data{"requestUrl": r.RequestURI, "params": r.URL.Query()})
			}

		} else {
			h.logger.Debug("session-timeout")
		}
		accessToken, tokenExists := r.Header["Authorization"]
		if tokenExists && accessToken[0] != "" {
			h.logger.Debug("token-exists-in-session", lager.Data{"requestUrl": r.RequestURI, "params": r.URL.Query()})
			next.ServeHTTP(w, r)
		} else {
			h.logger.Debug("token-does-not-exist-in-session,redirect-to-oauth-process", lager.Data{"requestUrl": r.RequestURI, "params": r.URL.Query()})
			h.uaaHelper.RedirectToAuthEndpoint(w, r)
		}

	})
}
