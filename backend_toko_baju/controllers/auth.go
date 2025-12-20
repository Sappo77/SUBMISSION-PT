package controllers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/sappo77/backend_toko_baju/config"
	"github.com/sappo77/backend_toko_baju/models"
	"golang.org/x/crypto/bcrypt"
)


func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func Login(w http.ResponseWriter, r *http.Request) {
	jwtKey := []byte(os.Getenv("JWT_SECRET"))

	var creds models.Credentials
	if json.NewDecoder(r.Body).Decode(&creds) != nil {
		log.Println("Kesalahan ketika request login")
		respondWithError(w, http.StatusBadRequest, "Body request Invalid")
		return
	}

	var hashedPassword string
	var userID string
	var role string 
	err := config.DB.QueryRow(
		"SELECT id, password_hash, role FROM users WHERE username = ?", creds.Username).
		Scan(&userID, &hashedPassword, &role)
	
	if err == sql.ErrNoRows {
		log.Printf("Login gagal: Pengguna %s tidak ditemukan", creds.Username)
		respondWithError(w, http.StatusUnauthorized, "Username atau password salah")
		return
	}
	if err != nil {
		log.Printf("Login DB Error: %v", err) 
		respondWithError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	if !CheckPasswordHash(creds.Password, hashedPassword) {
		log.Println("Login Gagal: Password tidak sesuai.")
		respondWithError(w, http.StatusUnauthorized, "Username atau password salah")
		return
	}

	// Generate JWT
	expirationTime := time.Now().Add(time.Hour * 24)
	claims := jwt.MapClaims{
		"user_id": userID,
		"username": creds.Username,
		"exp": expirationTime.Unix(),
		"role": role,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
    if err != nil {
        log.Printf("Error pembuatan token: %v", err)
        respondWithError(w, http.StatusInternalServerError, "Gagal membuat token otentikasi")
        return
    }

	respondWithJSON(w, http.StatusOK, map[string]string{
		"token": tokenString,
        "role": role,
	})
}