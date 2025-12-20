package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14) 
	return string(bytes), err
}

func InitDB() {
	godotenv.Load()
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Error opening database connection: %v", err)
	}
	
	DB.SetConnMaxLifetime(5 * time.Minute)

	if err := DB.Ping(); err != nil {
		log.Fatalf("Gagal konek ke MySQL. Pastikan service DB aktif dan DB_NAME '%s' sudah dibuat: %v", dbName, err)
	}

	log.Println("Successfully connected to MySQL!")
	createTables() 
}

func createTables() {
	queries := []string{
	
		`CREATE TABLE IF NOT EXISTS users (
			id VARCHAR(64) PRIMARY KEY, 
			username VARCHAR(50) UNIQUE NOT NULL, 
			password_hash VARCHAR(255) NOT NULL, 
			role VARCHAR(20) NOT NULL DEFAULT 'admin'
		);`,
       
		`CREATE TABLE IF NOT EXISTS products (
			id INT AUTO_INCREMENT PRIMARY KEY, 
			nama VARCHAR(255) NOT NULL,
			deskripsi TEXT, 
			harga DECIMAL(10, 2) NOT NULL
		);`,
        
		`CREATE TABLE IF NOT EXISTS variants (
			id INT AUTO_INCREMENT PRIMARY KEY, 
			produk_id INT NOT NULL, 
			sku VARCHAR(50) UNIQUE NOT NULL, 
			warna VARCHAR(50), 
			image_url VARCHAR(255), 
			FOREIGN KEY (produk_id) REFERENCES products(id) ON DELETE CASCADE
		);`,
        
		`CREATE TABLE IF NOT EXISTS stocks (
			id INT AUTO_INCREMENT PRIMARY KEY, 
			variant_id INT NOT NULL, 
			ukuran VARCHAR(10) NOT NULL, 
			quantity INT NOT NULL DEFAULT 0, 
			FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE CASCADE, 
			UNIQUE KEY (variant_id, ukuran)
		);`,
        
		`CREATE TABLE IF NOT EXISTS stock_movements (
			id INT AUTO_INCREMENT PRIMARY KEY, 
			variant_id INT NOT NULL, 
			ukuran VARCHAR(10) NOT NULL, 
			movement_type ENUM('IN', 'OUT') NOT NULL, 
			quantity_change INT NOT NULL, 
			movement_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
			FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE RESTRICT
		);`,
	}

	for _, query := range queries {
		if _, err := DB.Exec(query); err != nil {
			log.Fatalf("GAGAL MEMBUAT TABEL: %v\nQuery: %s", err, query)
		}
	}
	log.Println("SUKSES MEMBUAT TABEL")
	SeedAdminUser()
}

func SeedAdminUser() {
	username := "admin"
	password := "admin123"

	var count int
	if err := DB.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", username).Scan(&count); err != nil {
		log.Printf("Error checking admin user: %v", err)
		return
	}

	if count == 0 {
		hashedPassword, _ := HashPassword(password)
		_, err := DB.Exec(
			"INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)",
			uuid.NewString(), username, hashedPassword, "admin")
		
		if err != nil {
			log.Printf("Warning: Failed to seed admin user: %v", err)
		} else {
			log.Println("Default admin user 'admin' (password: admin123) seeded.")
		}
	} else {
		log.Println("Default admin user 'admin' sudah ada di database.")
	}
}