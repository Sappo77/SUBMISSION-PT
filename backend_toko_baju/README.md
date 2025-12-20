# Backend Toko Baju API

## Setup Instructions

1. **Database Setup**
   - Install MySQL
   - Create database: `CREATE DATABASE toko_baju_db;`
   - Update `.env` file with your database credentials

2. **Environment Variables**
   - Copy `.env` file and update values:
     - `DB_USER`: Your MySQL username
     - `DB_PASSWORD`: Your MySQL password
     - `JWT_SECRET`: Change to a secure random string

3. **Run Application**
   ```bash
   go mod tidy
   go run main.go
   ```

## API Endpoints

### Public Endpoints
- `POST /v1/login` - Login with username/password
- `GET /v1/products` - Get all products

### Admin Endpoints (Requires JWT Token)
- `POST /admin/v1/products` - Create product
- `PUT /admin/v1/products/{id}` - Update product
- `DELETE /admin/v1/products/{id}` - Delete product

## Default Admin Credentials
- Username: `admin`
- Password: `admin123`

## Postman Testing

1. **Login**: POST to `/v1/login` with admin credentials
2. **Get Token**: Copy the token from login response
3. **Admin Requests**: Add `Authorization: Bearer <token>` header