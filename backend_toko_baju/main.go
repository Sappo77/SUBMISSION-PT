package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"github.com/sappo77/backend_toko_baju/config"
	"github.com/sappo77/backend_toko_baju/controllers"
	"github.com/sappo77/backend_toko_baju/middlewares"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: Could not load .env file. Using system environment variables.")
	}
	
	config.InitDB() 

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second)) 
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"}, // Izinkan semua origin untuk akses dari laptop lain
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300, 
	}))

	r.Route("/v1", func(api chi.Router) {
	
		api.Post("/login", controllers.Login) 

		api.Get("/products", controllers.GetProductsStock)
		api.Get("/products/{id}", controllers.GetProductByIDHandler)
	})

	r.Route("/admin/v1", func(admin chi.Router) {
		admin.Use(middlewares.AuthMiddleware)

		admin.Post("/products", controllers.CreateProductHandler)
		admin.Put("/products/{id}", controllers.UpdateProductHandler)
		admin.Delete("/products/{id}", controllers.DeleteProductHandler)
		admin.Post("/restock", controllers.RestockHandler)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
    
	log.Printf("Server berjalan di http://0.0.0.0:%s", port) 
	log.Fatal(http.ListenAndServe("0.0.0.0:"+port, r))
}