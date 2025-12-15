package config

import (
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() {
	conn, err := sql.Open("mysql", "root:@tcp(localhost:3306)/?parseTime=true")
	if err != nil {
		log.Fatal(err)
	}

	conn.Exec("CREATE DATABASE IF NOT EXISTS toko_baju")
	conn.Close()

	DB, err = sql.Open("mysql", "root:@tcp(localhost:3306)/toko_baju?parseTime=true")
	if err != nil {
		log.Fatal(err)
	}

	createTables()
	log.Println("DATABASE DIBUAT")

}

func createTables(){
	DB.Exec(`
	CREATE TABLE IF NOT EXISTS users (
		id INT AUTO_INCREMENT PRIMARY KEY,
		nama VARCHAR (100),
		email VARCHAR (100) UNIQUE,
		password VARCHAR (255),
		role ENUM ('admin','customer')	
	)`)	

	DB.Exec(`CREATE TABLE IF NOT EXISTS kategori (
		id INT AUTO_INCREMENT PRIMARY KEY,
		nama VARCHAR (100)
	)`)

	DB.Exec(`CREATE TABLE IF NOT EXISTS produk (
		id INT AUTO_INCREMENT PRIMARY KEY,
		nama VARCHAR (100),
		price DOUBLE,
		stok INT,
		kategori_id INT,
		FOREIGN KEY (kategori_id) REFERENCES kategori(id)
	)`)

	DB.Exec(`CREATE TABLE IF NOT EXISTS orders (
		id INT AUTO_INCREMENT PRIMARY KEY,
		user_id INT,
		total DOUBLE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id)
	)`)

	DB.Exec(`CREATE TABLE IF NOT EXISTS items (
		id INT AUTO_INCREMENT PRIMARY KEY,
		order_id INT,
		produk_id INT,
		quantity INT,
		price DOUBLE,
		FOREIGN KEY (order_id) REFERENCES orders(id),
		FOREIGN KEY (produk_id) REFERENCES produk(id)
	)`)
}