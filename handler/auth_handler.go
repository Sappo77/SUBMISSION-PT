package handlers

import (
	"encoding/json"
	"net/http"

	"toko_baju/config"
	"toko_baju/models"
	"toko_baju/utils"

	"golang.org/x/crypto/bcrypt"
)

func Login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	json.NewDecoder(r.Body).Decode(&input)

	var user models.User
	err := config.DB.QueryRow(
		"SELECT id, nama, email, password, role FROM users WHERE email = ?",
		input.Email,
	).Scan(&user.ID, &user.Nama, &user.Email, &user.Password, &user.Role)

	if err != nil {
		http.Error(w, "User tidak ditemukan", http.StatusUnauthorized)
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)) != nil {
		http.Error(w, "Password salah", http.StatusUnauthorized)
		return
	}

	token, _ := utils.GenerateJWT(int(user.ID), user.Role)

	json.NewEncoder(w).Encode(map[string]string{
		"token": token,
	})
}