package models

type Produk struct {
	ID int64 `json:"id"`
	Nama string `json:"nama"`
	Price float64 `json:"price"`
	Stock int64 `json:"stock"`
	KategoriID string `json:"kategori_id"`
}