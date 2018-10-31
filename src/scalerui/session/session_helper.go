package session

import (
	"scalerui/models"

	"crypto/rand"
	"encoding/base64"
	"io"
	"net/http"
	"sync"
	"time"

	"code.cloudfoundry.org/clock"
	"github.com/gorilla/sessions"
)

const (
	SessionIdName        = "JSESSIONID"
	SessionStoreKeyPairs = "scaler-ui-session-secrects"
)

type SessionObject struct {
	expiry time.Time
	value  interface{}
}
type SessionManager interface {
	GetUAAToken(r *http.Request) *models.UAAToken
	SetUAAToken(w http.ResponseWriter, r *http.Request, tokens *models.UAAToken)
	ClearUAAToken(w http.ResponseWriter, r *http.Request)
}
type sessionManager struct {
	sessionStore           *sessions.CookieStore
	sessionIdObjectMap     map[string]SessionObject
	sessionTimeout         time.Duration
	rwLock                 sync.RWMutex
	clock                  clock.Clock
	sessionRefreshInterval time.Duration
	doneChan               chan bool
}

func NewSessionManager(sessionTimeout time.Duration, sessionRefreshInterval time.Duration) *sessionManager {
	sessionStore := sessions.NewCookieStore([]byte(SessionStoreKeyPairs))
	sessionStore.MaxAge(int(sessionTimeout / time.Second))
	sm := &sessionManager{
		sessionStore:           sessionStore,
		sessionIdObjectMap:     make(map[string]SessionObject),
		rwLock:                 sync.RWMutex{},
		sessionTimeout:         sessionTimeout,
		sessionRefreshInterval: sessionRefreshInterval,
		clock:    clock.NewClock(),
		doneChan: make(chan bool),
	}
	go sm.startClearingExpiredSession()
	return sm
}

func (sm *sessionManager) GetUAAToken(r *http.Request) *models.UAAToken {
	session, _ := sm.sessionStore.Get(r, SessionIdName)
	if sessionIdValue, sessionExists := session.Values[SessionIdName]; sessionExists {
		sessionIdValue, _ := sessionIdValue.(string)
		sm.rwLock.RLock()
		defer sm.rwLock.RUnlock()
		if sessionObj, ok := sm.sessionIdObjectMap[sessionIdValue]; ok && sessionObj.value != nil {
			sessionObj.expiry = time.Now().Add(sm.sessionTimeout)
			tokens := sessionObj.value.(*models.UAAToken)
			return tokens

		}
	}
	return nil

}

func (sm *sessionManager) SetUAAToken(w http.ResponseWriter, r *http.Request, tokens *models.UAAToken) {
	theSession, _ := sm.sessionStore.Get(r, SessionIdName)
	sessionId := sm.getSessionId()
	theSession.Values[SessionIdName] = sessionId
	// h.ssom.SetSessionToken(sessionId, tokens)
	theSession.Save(r, w)
	sm.rwLock.Lock()
	defer sm.rwLock.Unlock()
	sm.sessionIdObjectMap[sessionId] = SessionObject{
		value:  tokens,
		expiry: time.Now().Add(sm.sessionTimeout),
	}
	// time.AfterFunc(sm.sessionTimeout, func() {
	// 	sm.rwLock.Lock()
	// 	defer sm.rwLock.Unlock()
	// 	delete(sm.sessionIdObjectMap, sessionId)
	// })

}

func (sm *sessionManager) ClearUAAToken(w http.ResponseWriter, r *http.Request) {
	theSession, _ := sm.sessionStore.Get(r, SessionIdName)
	if theSession != nil {
		sessionId := theSession.Values[SessionIdName]
		sessionIdValue := sessionId.(string)
		sm.rwLock.Lock()
		delete(sm.sessionIdObjectMap, sessionIdValue)
		sm.rwLock.Unlock()
		theSession.Options.MaxAge = -1
		theSession.Save(r, w)
	}

}

func (sm *sessionManager) getSessionId() string {
	b := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return ""
	}
	return base64.URLEncoding.EncodeToString(b)
}
func (sm *sessionManager) removeExpiredSession() {
	sm.rwLock.Lock()
	defer sm.rwLock.Unlock()
	for sessionId, sessionObj := range sm.sessionIdObjectMap {
		if sessionObj.expiry.Before(time.Now()) {
			delete(sm.sessionIdObjectMap, sessionId)
		}
	}

}

// func (sm *sessionManager) StartClearingExpiredSession() {
// 	go sm.startClearingExpiredSession()
// }

// func (sm *sessionManager) StopClearingExpiredSession() {
// 	close(sm.doneChan)
// }
func (sm *sessionManager) startClearingExpiredSession() {
	ticker := sm.clock.NewTicker(sm.sessionRefreshInterval)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C():
			sm.removeExpiredSession()

		}
	}
}
