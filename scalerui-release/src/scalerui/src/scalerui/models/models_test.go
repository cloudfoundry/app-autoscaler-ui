package models_test

import (
	"time"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"

	. "scalerui/models"
)

var _ = Describe("Models", func() {
	var uaaToken UAAToken

	Context("UAAToken", func() {
		Context("UAAToken", func() {
			var expired bool
			JustBeforeEach(func() {
				expired = uaaToken.IsExpired()
			})
			Context("when TokenExpiry is earlier than (now + 1 min)", func() {
				BeforeEach(func() {
					uaaToken = UAAToken{
						TokenExpiry: int64(time.Now().Unix()),
					}
				})
				It("return true", func() {
					Expect(expired).To(Equal(true))
				})
			})

			Context("when TokenExpiry is later than (now + 1 min)", func() {
				BeforeEach(func() {
					uaaToken = UAAToken{
						TokenExpiry: int64(time.Now().Add(3 * time.Minute).Unix()),
					}
				})
				It("return false", func() {
					Expect(expired).To(Equal(false))
				})
			})
		})
	})
})
