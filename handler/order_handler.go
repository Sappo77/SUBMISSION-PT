package handlers

import (
	"encoding/json"
	"net/http"

	"toko-baju/config"
	"toko-baju/models"
)

func Checkout(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("user_id").(int)

	var req models.OrderRequest
	json.NewDecoder(r.Body).Decode(&req)

	tx, _ := config.DB.Begin()

	var total float64
	for _, item := range req.Items {
		var price float64
		tx.QueryRow("SELECT price FROM produk WHERE id=?", item.ProductID).Scan(&price)
		total += price * float64(item.Quantity)
	}

	res, _ := tx.Exec("INSERT INTO orders (user_id, total) VALUES (?, ?)", userID, total)
	orderID, _ := res.LastInsertId()

	for _, item := range req.Items {
		var price float64
		tx.QueryRow("SELECT price FROM produk WHERE id=?", item.ProductID).Scan(&price)

		tx.Exec(`
			INSERT INTO items (order_id, produk_id, quantity, price)
			VALUES (?, ?, ?, ?)`,
			orderID, item.ProductID, item.Quantity, price,
		)

		tx.Exec(
			"UPDATE produk SET stok = stok - ? WHERE id=?",
			item.Quantity, item.ProductID,
		)
	}

	tx.Commit()
	w.WriteHeader(http.StatusCreated)
}
