package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"toko-baju/config"
	"toko-baju/models"

	"github.com/go-chi/chi/v5"
)

func GetProducts(w http.ResponseWriter, r *http.Request) {
	rows, _ := config.DB.Query("SELECT id, nama, price, stok, kategori_id FROM produk")
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		rows.Scan(&p.ID, &p.Nama, &p.Price, &p.Stok, &p.KategoriID)
		products = append(products, p)
	}

	json.NewEncoder(w).Encode(products)
}

func CreateProduct(w http.ResponseWriter, r *http.Request) {
	var p models.Product
	json.NewDecoder(r.Body).Decode(&p)

	config.DB.Exec(
		"INSERT INTO produk (nama, price, stok, kategori_id) VALUES (?, ?, ?, ?)",
		p.Nama, p.Price, p.Stok, p.KategoriID,
	)

	w.WriteHeader(http.StatusCreated)
}

func UpdateProduct(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(chi.URLParam(r, "id"))

	var p models.Product
	json.NewDecoder(r.Body).Decode(&p)

	config.DB.Exec(
		"UPDATE produk SET nama=?, price=?, stok=?, kategori_id=? WHERE id=?",
		p.Nama, p.Price, p.Stok, p.KategoriID, id,
	)

	w.WriteHeader(http.StatusOK)
}

func DeleteProduct(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	config.DB.Exec("DELETE FROM produk WHERE id=?", id)
	w.WriteHeader(http.StatusNoContent)
}
