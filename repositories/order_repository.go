package repositories

import (
	"toko_baju/config"
	"toko_baju/models"
)

func CreateOrder(order *models.Order) (int, error) {
	result, err := config.DB.Exec(`
		INSERT INTO orders (user_id, total)
		VALUES (?, ?)
	`, order.UserId, order.Total)

	if err != nil {
		return 0, err
	}

	id, _ := result.LastInsertId()
	return int(id), nil
}

func CreateOrderItem(item *models.OrderItem) error {
	_, err := config.DB.Exec(`
		INSERT INTO items (order_id, produk_id, quantity, price)
		VALUES (?, ?, ?, ?)
	`, item.OrderId, item.ProdukId, item.Quantity, item.Price)

	return err
}

func GetOrdersByUser(userID int) ([]models.Order, error) {
	rows, err := config.DB.Query(`
		SELECT id, user_id, total, created_at
		FROM orders
		WHERE user_id = ?
	`, userID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		rows.Scan(&o.ID, &o.UserId, &o.Total, &o.CreatedAT)
		orders = append(orders, o)
	}

	return orders, nil
}
