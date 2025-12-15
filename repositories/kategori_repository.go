package repositories

import (
	"toko_baju/config"
	"toko_baju/models"
)

func GetAllCategories() ([]models.Kategori, error) {
	rows, err := config.DB.Query("SELECT id, nama FROM kategori")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.Kategori
	for rows.Next() {
		var c models.Kategori
		rows.Scan(&c.ID, &c.Nama)
		categories = append(categories, c)
	}

	return categories, nil
}