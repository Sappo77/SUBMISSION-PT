package models

type User struct {
	ID int64 `json:"id"`
	Nama string `json:"nama"`
	Email string `json:"email"`
	Password string `json:"-"`
	Role string `json:"role"`
}