package models

import(
	"time"
)

type Stock struct {
	ID int `json:"id"`
	VariantID int `json:"variant_id"`
	Ukuran string `json:"ukuran"`
	Quantity int `json:"quantity"` 
}

type Variant struct {
	ID int `json:"id"`
	ProductID int `json:"product_id"` 
	SKU string `json:"sku"`
	Warna string `json:"warna"`
	ImageURL string `json:"image_url"`
	Stocks []Stock `json:"stocks"`
}

type Product struct {
	ID int `json:"id"`
	Nama string `json:"nama"`
	Deskripsi string `json:"deskripsi"`
	Harga float64 `json:"harga"`
	TotalStock int `json:"total_stock"` 
	Variants []Variant `json:"variants"`
}

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type ProductInput struct {
	Nama string `json:"nama"`
	Deskripsi string `json:"deskripsi"`
	Harga float64 `json:"harga"`
    Variants []VariantInput `json:"variants"` 
}

type VariantInput struct {
    SKU string `json:"sku"`
	Warna string `json:"warna"`
	ImageURL string `json:"image_url"`
    Stocks []StockInput `json:"stocks"` 
}

type StockInput struct {
    Ukuran string `json:"ukuran"`
	Quantity int `json:"quantity"` 
}

type StockMovement struct {
    ID             int       `json:"id"`
    VariantID      int       `json:"variant_id"`
    Ukuran         string    `json:"ukuran"`
    MovementType   string    `json:"movement_type"`
    QuantityChange int       `json:"quantity_change"`
    MovementDate   time.Time `json:"movement_date"`
}

type RestockInput struct {
    VariantID int `json:"variant_id"`
    Ukuran    string `json:"ukuran"`
    Quantity  int `json:"quantity"`
}