package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/sappo77/backend_toko_baju/config"
	"github.com/sappo77/backend_toko_baju/models"
)

func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}

func GetProductsStock(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT 
			p.id, p.nama, p.deskripsi, p.harga, 
			v.id, v.sku, v.warna, v.image_url,
			s.id, s.ukuran, s.quantity
		FROM products p
		LEFT JOIN variants v ON p.id = v.produk_id
		LEFT JOIN stocks s ON v.id = s.variant_id
		ORDER BY p.id, v.id, s.id;
	`
	rows, err := config.DB.Query(query)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Gagal mengambil data produk")
		return
	}
	defer rows.Close()

	productsMap := make(map[int]models.Product)
	
	for rows.Next() {
		var (
			pID, vID, sID sql.NullInt32
			
			pNama, pDesc, vSKU, vWarna, vImage, sUkuran sql.NullString
			
			pHarga sql.NullFloat64
			sQuantity sql.NullInt32
		)
		
		err := rows.Scan(
			&pID, &pNama, &pDesc, &pHarga, 
			&vID, &vSKU, &vWarna, &vImage, 
			&sID, &sUkuran, &sQuantity,
		)
		if err != nil {
			log.Printf("Periksa error: %v", err)
			continue
		}
		
		productID := int(pID.Int32)
		product := productsMap[productID]

		if product.ID == 0 {
			product = models.Product{
				ID: productID,
				Nama: pNama.String, 
				Deskripsi: pDesc.String,
				Harga: pHarga.Float64,
				Variants: make([]models.Variant, 0),
			}
		}

		if vID.Valid {
			variantID := int(vID.Int32)
			var variant *models.Variant
			found := false

			for i := range product.Variants {
				if product.Variants[i].ID == variantID {
					variant = &product.Variants[i]
					found = true
					break
				}
			}

			if !found {
				newVariant := models.Variant{
					ID: variantID,
					ProductID: productID,
					SKU: vSKU.String,
					Warna: vWarna.String,
					ImageURL: vImage.String,
					Stocks: make([]models.Stock, 0),
				}
				product.Variants = append(product.Variants, newVariant)
				variant = &product.Variants[len(product.Variants)-1]
			}
			
			if sID.Valid {
				variant.Stocks = append(variant.Stocks, models.Stock{
					ID: int(sID.Int32),
					VariantID: variantID,
					Ukuran: sUkuran.String,
					Quantity: int(sQuantity.Int32),
				})
			}
		}
		
		productsMap[productID] = product
	}

	products := make([]models.Product, 0, len(productsMap))
	for _, p := range productsMap {
		totalStock := 0
		for _, v := range p.Variants {
			for _, s := range v.Stocks {
				totalStock += s.Quantity
			}
		}
		p.TotalStock = totalStock 
		products = append(products, p)
	}
	
	respondWithJSON(w, http.StatusOK, products)
}

func CreateProductHandler(w http.ResponseWriter, r *http.Request) {
	var req models.ProductInput
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Request payload Invalid")
		return
	}

	if req.Nama == "" || req.Harga <= 0 || len(req.Variants) == 0 {
		respondWithError(w, http.StatusBadRequest, "Nama, Harga, dan minimal satu Varian wajib diisi.")
		return
	}
	
	tx, err := config.DB.Begin()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Server error: gagal memulai transaksi")
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		} else if err != nil {
			tx.Rollback()
		}
	}()
	
	productQuery := "INSERT INTO products (nama, deskripsi, harga) VALUES (?, ?, ?)"
	result, err := tx.Exec(productQuery, req.Nama, req.Deskripsi, req.Harga)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Gagal menambahkan produk")
		return
	}
	productID, _ := result.LastInsertId()
	
	for _, variant := range req.Variants {
		if variant.SKU == "" || len(variant.Stocks) == 0 {
			err = fmt.Errorf("Kesalahan validasi: data varian tidak lengkap")
			respondWithError(w, http.StatusBadRequest, "SKU dan minimal satu Stok wajib diisi untuk setiap varian")
			return
		}
		
		variantQuery := "INSERT INTO variants (produk_id, sku, warna, image_url) VALUES (?, ?, ?, ?)"
		variantResult, err := tx.Exec(variantQuery, productID, variant.SKU, variant.Warna, variant.ImageURL)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Gagal menambahkan varian (SKU mungkin sudah ada)")
			return
		}
		variantID, _ := variantResult.LastInsertId()
		
		stockQuery := "INSERT INTO stocks (variant_id, ukuran, quantity) VALUES (?, ?, ?)"
		for _, stock := range variant.Stocks {
			_, err = tx.Exec(stockQuery, variantID, stock.Ukuran, stock.Quantity)
			if err != nil {
				respondWithError(w, http.StatusInternalServerError, "Gagal menambahkan stok")
				return
			}
		}
	} 

	if err = tx.Commit(); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Gagal menyimpan data")
		return
	}

	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message":   "Produk dan varian berhasil ditambahkan",
		"produk_id": productID,
	})
}

func UpdateProductHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr) 
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "ID produk harus berupa angka")
		return
	}

	var input struct {
		Nama      string  `json:"nama"`
		Deskripsi string  `json:"deskripsi"`
		Harga     float64 `json:"harga"`
	}
	
	if json.NewDecoder(r.Body).Decode(&input) != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if input.Nama == "" || input.Harga <= 0 {
		respondWithError(w, http.StatusBadRequest, "Nama dan Harga wajib diisi")
		return
	}

	result, err := config.DB.Exec(
		"UPDATE products SET nama=?, deskripsi=?, harga=? WHERE id=?",
		input.Nama, input.Deskripsi, input.Harga, id, 
	)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Gagal mengupdate produk")
		return
	}

	if rows, _ := result.RowsAffected(); rows == 0 {
		respondWithError(w, http.StatusNotFound, "Produk tidak ditemukan")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": fmt.Sprintf("Produk ID %d berhasil diupdate", id)})
}

func DeleteProductHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr) 
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "ID produk harus berupa angka")
		return
	}

	result, err := config.DB.Exec("DELETE FROM products WHERE id = ?", id)
	if err != nil {
		log.Printf("Error deleting product: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Gagal menghapus produk")
		return
	}

	if rows, _ := result.RowsAffected(); rows == 0 {
		respondWithError(w, http.StatusNotFound, "Produk tidak ditemukan")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func GetProductByIDHandler(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "ID produk harus berupa angka")
		return
	}

	query := `
		SELECT 
			p.id, p.nama, p.deskripsi, p.harga, 
			v.id, v.sku, v.warna, v.image_url,
			s.id, s.ukuran, s.quantity
		FROM products p
		LEFT JOIN variants v ON p.id = v.produk_id
		LEFT JOIN stocks s ON v.id = s.variant_id
		WHERE p.id = ?
		ORDER BY v.id, s.id;
	`
	rows, err := config.DB.Query(query, id)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Gagal mengambil data produk")
		return
	}
	defer rows.Close()

	var product models.Product
	variantsMap := make(map[int]*models.Variant)
	found := false

	for rows.Next() {
		var (
			pID, vID, sID sql.NullInt32
			pNama, pDesc, vSKU, vWarna, vImage, sUkuran sql.NullString
			pHarga sql.NullFloat64
			sQuantity sql.NullInt32
		)

		err := rows.Scan(
			&pID, &pNama, &pDesc, &pHarga,
			&vID, &vSKU, &vWarna, &vImage,
			&sID, &sUkuran, &sQuantity,
		)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}

		if !found {
			product = models.Product{
				ID:        int(pID.Int32),
				Nama:      pNama.String,
				Deskripsi: pDesc.String,
				Harga:     pHarga.Float64,
				Variants:  make([]models.Variant, 0),
			}
			found = true
		}

		if vID.Valid {
			variantID := int(vID.Int32)
			variant, exists := variantsMap[variantID]
			if !exists {
				newVariant := &models.Variant{
					ID:        variantID,
					ProductID: int(pID.Int32),
					SKU:       vSKU.String,
					Warna:     vWarna.String,
					ImageURL:  vImage.String,
					Stocks:    make([]models.Stock, 0),
				}
				variantsMap[variantID] = newVariant
				variant = newVariant
			}

			if sID.Valid {
				variant.Stocks = append(variant.Stocks, models.Stock{
					ID:        int(sID.Int32),
					VariantID: variantID,
					Ukuran:    sUkuran.String,
					Quantity:  int(sQuantity.Int32),
				})
			}
		}
	}

	if !found {
		respondWithError(w, http.StatusNotFound, "Produk tidak ditemukan")
		return
	}

	for _, variant := range variantsMap {
		product.Variants = append(product.Variants, *variant)
	}

	totalStock := 0
	for _, v := range product.Variants {
		for _, s := range v.Stocks {
			totalStock += s.Quantity
		}
	}
	product.TotalStock = totalStock

	respondWithJSON(w, http.StatusOK, product)
}