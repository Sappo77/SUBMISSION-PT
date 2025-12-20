// backend/middlewares/auth.go
package middlewares

import (
	"context"
	"net/http"
	"os"
	"strings"
	"log"

	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		jwtKey := []byte(os.Getenv("JWT_SECRET"))
		if len(jwtKey) == 0 {
			log.Println("JWT_SECRET tidak terbaca!")
			http.Error(w, "Server error", http.StatusInternalServerError)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Token tidak ditemukan atau format salah", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		
		claims := jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			log.Printf("Token validation failed: %v", err)
			http.Error(w, "Token expired", http.StatusUnauthorized)
			return
		}

		role, ok := claims["role"].(string)
		if !ok || role != "admin" {
			http.Error(w, "Akses ditolak: Hanya Admin yang boleh", http.StatusForbidden)
			return
		}

		ctx := context.WithValue(r.Context(), "claims", claims)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}
