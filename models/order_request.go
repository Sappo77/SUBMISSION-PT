package models

type OrderRequest struct {
	Items []struct {
		ProdukID int64 `json:"produk_id"`
		Quantity int64 `json:"quantity"`
	} `json:"items"`
}