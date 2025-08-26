# 🛒 Grocery Store Management System

A comprehensive Flask-based web application for managing grocery store operations with Indian market pricing and features.

## ✨ Features

- **Product Management**: Add, edit, delete, and view products with Indian Rupee pricing
- **Customer Management**: Maintain customer database with detailed information
- **Order Management**: Create and track orders with automatic total calculations
- **Inventory Tracking**: Monitor stock levels and product availability
- **Responsive Design**: Mobile-friendly interface with Bootstrap 5
- **Indian Localization**: Currency in ₹ (Indian Rupees) with realistic market pricing
- **Comprehensive Error Handling**: Robust error management and validation
- **Database Integrity**: Foreign key constraints and transaction management

## 🚀 Quick Start

### Prerequisites

- Python 3.7+
- MySQL Server 8.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Grocery-Store
   ```

2. **Create virtual environment**
   ```bash
   python -m venv ve
   # Windows
   ve\Scripts\activate
   # Linux/Mac
   source ve/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE grocery_store;
   exit

   # Import database structure and sample data
   mysql -u root -p grocery_store < db.sql
   ```

5. **Configure Database Connection**
   - Edit `config.py` with your MySQL credentials:
   ```python
   MYSQL_USER = 'your_username'
   MYSQL_PASSWORD = 'your_password'
   MYSQL_HOST = 'localhost'
   MYSQL_DATABASE = 'grocery_store'
   ```

6. **Run the Application**
   ```bash
   python app.py
   ```

7. **Access the Application**
   - Open your browser and navigate to `http://localhost:5000`

## 📊 Database Schema

### Products Table
- **product_id**: Primary key (auto-increment)
- **name**: Product name (varchar, 255)
- **uom_id**: Unit of measure ID (foreign key)
- **price_per_unit**: Price in Indian Rupees (decimal, 10,2)

### Customers Table
- **customer_id**: Primary key (auto-increment)
- **customer_name**: Customer name (varchar, 255)
- **location**: Customer address (varchar, 255)
- **contact_number**: Phone number (varchar, 15)

### Orders Table
- **order_id**: Primary key (auto-increment)
- **customer_id**: Foreign key to customers table
- **total**: Order total in ₹ (decimal, 10,2)
- **datetime**: Order timestamp

### Order Details Table
- **order_id**: Foreign key to orders table
- **product_id**: Foreign key to products table
- **quantity**: Product quantity (decimal, 10,2)
- **total_price**: Line item total in ₹ (decimal, 10,2)

### Units of Measure Table
- **uom_id**: Primary key (auto-increment)
- **uom_name**: Unit name (kg, ltr, piece, pack, dozen)

## 🛍️ Sample Data

The system comes pre-loaded with:
- **82 Products** across 12 categories with realistic Indian market pricing
- **30 Diverse Customers** from various locations
- **Sample Orders** to demonstrate functionality
- **5 Units of Measure** (kg, ltr, piece, pack, dozen)

### Product Categories Include:
- Grains and Cereals (₹20 - ₹800)
- Dairy Products (₹60 - ₹500)  
- Meat and Poultry (₹300 - ₹1200)
- Fresh Vegetables (₹25 - ₹200)
- Fruits (₹50 - ₹300)
- Beverages (₹30 - ₹800)
- Pantry Items (₹20 - ₹800)
- Bakery Items (₹25 - ₹300)
- Frozen Items (₹120 - ₹400)
- Snacks and Treats (₹50 - ₹600)
- Eggs and Protein (₹120 - ₹200)
- Household Items (₹80 - ₹300)

## 🔧 API Endpoints

### Products
- `GET /getProducts` - Fetch all products
- `POST /insertProduct` - Add new product
- `POST /updateProduct` - Update existing product
- `POST /deleteProduct` - Delete product

### Customers  
- `GET /getCustomers` - Fetch all customers
- `POST /insertCustomer` - Add new customer
- `POST /updateCustomer` - Update existing customer
- `POST /deleteCustomer` - Delete customer

### Orders
- `GET /getOrders` - Fetch all orders
- `POST /insertOrder` - Create new order
- `GET /getOrderDetails/<order_id>` - Get order details

### Units of Measure
- `GET /getUOM` - Fetch all units of measure

## 🐳 Docker Deployment

### Development
```bash
docker-compose up --build
```

### Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📱 Features Overview

### Dashboard
- Overview of total products, customers, and orders
- Recent activity feed
- Quick access to all modules

### Product Management
- Add products with Indian Rupee pricing
- Bulk import/export capabilities  
- Category-wise filtering
- Stock level indicators

### Customer Management
- Customer profile management
- Order history tracking
- Contact information management
- Location-based sorting

### Order Management
- Multi-product order creation
- Automatic total calculations in ₹
- Order status tracking
- Print-friendly order receipts

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- CSRF protection
- Error handling without information leakage
- Database connection pooling

## 🛠️ Technology Stack

- **Backend**: Flask 2.0.1, Python 3.13
- **Database**: MySQL 8.0+ with Foreign Key Constraints
- **Frontend**: HTML5, CSS3, Bootstrap 5.1.3, JavaScript ES6+
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx (Production)

## 📈 Performance Optimizations

- Database connection pooling
- Efficient query optimization
- Responsive caching strategies
- Minimized JavaScript/CSS bundles
- Optimized database indices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

## 🙏 Acknowledgments

- Flask community for the excellent web framework
- Bootstrap team for the responsive UI components
- MySQL team for the robust database system
- All contributors who helped improve this system

---

**Made with ❤️ for the Indian Grocery Market**