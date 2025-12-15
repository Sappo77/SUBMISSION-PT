package models

type OrderItem struct {
	ID int64 `json:"id"`
	OrderId int64 `json:"order_id"`
	ProdukId int64 `json:"produk_id"`
	Quantity int `json:"quantity"`
	Price float64 `json:"price"`
}