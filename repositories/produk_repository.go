package repositories

import (
	"toko_baju/config"
	"toko_baju/models"
)

func GetAllProducts() ([]models.Produk, error) {
	rows, err := config.DB.Query(`
		SELECT id, nama, price, stok, kategori_id
		FROM produk
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Produk
	for rows.Next() {
		var p models.Produk
		rows.Scan(
			&p.ID,
			&p.Nama,
			&p.Price,
			&p.Stock,
			&p.KategoriID,
		)
		products = append(products, p)
	}

	return products, nil
}

func GetProductByID(id int) (*models.Produk, error) {
	row := config.DB.QueryRow(`
		SELECT id, nama, price, stok, kategori_id
		FROM produk WHERE id = ?
	`, id)

	var p models.Produk
	err := row.Scan(
		&p.ID,
		&p.Nama,
		&p.Price,
		&p.Stock,
		&p.KategoriID,
	)

	if err != nil {
		return nil, err
	}

	return &p, nil
}

func CreateProduct(p *models.Produk) error {
	_, err := config.DB.Exec(`
		INSERT INTO produk (nama, price, stok, kategori_id)
		VALUES (?, ?, ?, ?)
	`, p.Nama, p.Price, p.Stock, p.KategoriID)

	return err
}

func UpdateProduct(id int, p *models.Produk) error {
	_, err := config.DB.Exec(`
		UPDATE produk
		SET nama=?, price=?, stok=?, kategori_id=?
		WHERE id=?
	`, p.Nama, p.Price, p.Stock, p.KategoriID, id)

	return err
}

func DeleteProduct(id int) error {
	_, err := config.DB.Exec("DELETE FROM produk WHERE id=?", id)
	return err
}