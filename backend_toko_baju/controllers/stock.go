package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/sappo77/backend_toko_baju/config"
	"github.com/sappo77/backend_toko_baju/models"
)

func RestockHandler(w http.ResponseWriter, r *http.Request) {
	var req models.RestockInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request")
		return
	}

	if req.VariantID <= 0 || req.Ukuran == "" || req.Quantity <= 0 {
		respondWithError(w, http.StatusBadRequest, "VariantID, Ukuran, dan Quantity harus diisi dan Quantity harus > 0")
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		log.Printf("Error saat melakukan pengisisan stok: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Server error: pengisisan database gagal")
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Println("error saat runtime, mengembalikkan stok semula", r)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	updateQuery := `
        INSERT INTO stocks (variant_id, ukuran, quantity) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `
	_, err = tx.Exec(updateQuery, req.VariantID, req.Ukuran, req.Quantity)
	if err != nil {
		log.Printf("Error pada saat update stok: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Gagal mengupdate stok")
		return
	}

	movementQuery := `
        INSERT INTO stock_movements (variant_id, ukuran, movement_type, quantity_change, movement_date)
        VALUES (?, ?, 'IN', ?, ?)
    `
    movementDate := time.Now()
	_, err = tx.Exec(movementQuery, req.VariantID, req.Ukuran, req.Quantity, movementDate)
	if err != nil {
		log.Printf("gagal mencatat perubahan stok: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Gagal mencatat riwayat stok")
		return
	}

	if err = tx.Commit(); err != nil {
		log.Printf("Gagal melakukan restok: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Gagal melakukan restock data")
		return
	}

	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Restock berhasil, stok telah ditambahkan dan riwayat dicatat",
	})
}