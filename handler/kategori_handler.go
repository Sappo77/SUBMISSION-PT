package handlers

import (
	"encoding/json"
	"net/http"

	"toko-baju/config"
	"toko-baju/models"
)

func GetCategories(w http.ResponseWriter, r *http.Request) {
	rows, _ := config.DB.Query("SELECT id, nama FROM kategori")
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var c models.Category
		rows.Scan(&c.ID, &c.Nama)
		categories = append(categories, c)
	}

	json.NewEncoder(w).Encode(categories)
}

func CreateCategory(w http.ResponseWriter, r *http.Request) {
	var c models.Category
	json.NewDecoder(r.Body).Decode(&c)

	config.DB.Exec("INSERT INTO kategori (nama) VALUES (?)", c.Nama)
	w.WriteHeader(http.StatusCreated)
}
