package session_test

import (
	"net/http"
	"net/http/httptest"
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	"scalerui/models"
	. "scalerui/session"
)

var _ = Describe("SessionHelper", func() {

	var (
		sessionManager         SessionManager
		sessionTimeout         time.Duration
		sessionRefreshInterval time.Duration
		responseWriter         http.ResponseWriter = httptest.NewRecorder()
		request                http.Request        = http.Request{}
		tokens                 models.UAAToken     = models.UAAToken{
			AccessToken:  "the-acess-token",
			RefreshToken: "the-refresh-token",
			ExpiresIn:    10000,
		}
	)

	Context("Session operation", func() {
		BeforeEach(func() {
			responseWriter = httptest.NewRecorder()
			request = http.Request{}
			sessionTimeout = 10 * time.Second
			sessionRefreshInterval = 5 * time.Second
			sessionManager = NewSessionManager(sessionTimeout, sessionRefreshInterval)
			sessionManager.SetUAAToken(responseWriter, &request, &tokens)
		})
		It("should get the tokens from session until sessionTimeout", func() {
			Consistently(func() models.UAAToken {
				tokens := sessionManager.GetUAAToken(&request)
				Expect(tokens).NotTo(BeNil())
				return *tokens
			}, sessionTimeout, 1*time.Second).Should(Equal(tokens))
		})
		It("should not get the tokens from session after sessionTimeout", func() {
			Consistently(func() models.UAAToken {
				tokens := sessionManager.GetUAAToken(&request)
				Expect(tokens).NotTo(BeNil())
				return *tokens
			}, sessionTimeout, 1*time.Second).Should(Equal(tokens))
			Eventually(func() *models.UAAToken {
				return sessionManager.GetUAAToken(&request)
			}, sessionRefreshInterval*2, 1*time.Second).Should(BeNil())
		})
		It("should not get the tokens from session after clear", func() {
			sessionManager.ClearUAAToken(responseWriter, &request)
			Expect(sessionManager.GetUAAToken(&request)).To(BeNil())
		})
	})
})
