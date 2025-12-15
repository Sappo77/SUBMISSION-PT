package repositories

import (
	"database/sql"
	"toko_baju/config"
	"toko_baju/models"
)

func FindUserByEmail(email string) (*models.User, error) {
	row := config.DB.QueryRow(`
		SELECT id, nama, email, password, role
		FROM users
		WHERE email = ?
	`, email)

	var user models.User
	err := row.Scan(
		&user.ID,
		&user.Nama,
		&user.Email,
		&user.Password,
		&user.Role,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	return &user, err
}

func FindUserByID(id int) (*models.User, error) {
	row := config.DB.QueryRow(`
		SELECT id, nama, email, role
		FROM users
		WHERE id = ?
	`, id)

	var user models.User
	err := row.Scan(
		&user.ID,
		&user.Nama,
		&user.Email,
		&user.Role,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	return &user, err
}