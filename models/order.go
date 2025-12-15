package models

import "time"

type Order struct {
	ID int64 `json:"id"`
	UserId int64 `json:"user_id"`
	Total int64 `json:"total"`
	CreatedAT time.Time `json:"created_at"`
	Items []OrderItem `json:"items,omitempty"`
}

