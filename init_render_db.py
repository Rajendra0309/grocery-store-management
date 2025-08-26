#!/usr/bin/env python3
"""
Initialize database for Render deployment
This script creates tables and inserts sample data
"""

import os
import sys
import mysql.connector
from mysql.connector import Error

# Use render configuration
os.environ['CONFIG_MODULE'] = 'config_render'

# Import configuration
try:
    from config_render import db_config
except ImportError as e:
    print(f"Error importing config: {e}")
    sys.exit(1)

def create_tables(cursor):
    """Create all required tables"""
    
    # Products table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            stock_quantity INT NOT NULL DEFAULT 0,
            category VARCHAR(100),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ''')
    
    # Customers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE,
            phone VARCHAR(20),
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ''')
    
    # Orders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT,
            total_amount DECIMAL(10, 2) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ''')
    
    # Order items table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            unit_price DECIMAL(10, 2) NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ''')
    
    print("✅ All tables created successfully")

def insert_sample_data(cursor):
    """Insert sample data for demonstration"""
    
    # Sample products
    products = [
        ('Fresh Apples', 3.99, 100, 'Fruits', 'Fresh red apples from local orchards'),
        ('Whole Milk', 2.49, 50, 'Dairy', 'Fresh whole milk, 1 gallon'),
        ('White Bread', 1.99, 30, 'Bakery', 'Fresh baked white bread loaf'),
        ('Ground Beef', 8.99, 25, 'Meat', 'Fresh ground beef, 1 lb package'),
        ('Bananas', 1.29, 80, 'Fruits', 'Fresh bananas, per bunch'),
        ('Cheddar Cheese', 4.99, 40, 'Dairy', 'Sharp cheddar cheese block'),
        ('Chicken Breast', 12.99, 20, 'Meat', 'Fresh chicken breast, 2 lb package'),
        ('Orange Juice', 3.49, 35, 'Beverages', 'Fresh squeezed orange juice'),
        ('Pasta', 2.99, 60, 'Pantry', 'Italian spaghetti pasta'),
        ('Tomatoes', 2.99, 45, 'Vegetables', 'Fresh vine tomatoes')
    ]
    
    cursor.executemany(
        "INSERT INTO products (name, price, stock_quantity, category, description) VALUES (%s, %s, %s, %s, %s)",
        products
    )
    
    # Sample customers
    customers = [
        ('John Smith', 'john.smith@email.com', '555-0123', '123 Main St, Anytown USA'),
        ('Mary Johnson', 'mary.j@email.com', '555-0456', '456 Oak Ave, Somewhere City'),
        ('Bob Wilson', 'bob.w@email.com', '555-0789', '789 Pine St, Another Town'),
        ('Alice Brown', 'alice.brown@email.com', '555-0321', '321 Elm St, Some City'),
        ('Charlie Davis', 'charlie.d@email.com', '555-0654', '654 Maple Ave, Other Town')
    ]
    
    cursor.executemany(
        "INSERT INTO customers (name, email, phone, address) VALUES (%s, %s, %s, %s)",
        customers
    )
    
    # Sample orders
    orders = [
        (1, 15.97, 'completed'),
        (2, 23.45, 'pending'),
        (3, 8.99, 'completed'),
        (1, 12.48, 'processing'),
        (4, 19.96, 'completed')
    ]
    
    cursor.executemany(
        "INSERT INTO orders (customer_id, total_amount, status) VALUES (%s, %s, %s)",
        orders
    )
    
    # Sample order items
    order_items = [
        (1, 1, 2, 3.99, 7.98),  # Order 1: 2 apples
        (1, 2, 1, 2.49, 2.49),  # Order 1: 1 milk
        (1, 3, 2, 1.99, 3.98),  # Order 1: 2 bread
        (2, 4, 1, 8.99, 8.99),  # Order 2: 1 ground beef
        (2, 5, 3, 1.29, 3.87),  # Order 2: 3 bananas
        (3, 4, 1, 8.99, 8.99),  # Order 3: 1 ground beef
        (4, 6, 2, 4.99, 9.98),  # Order 4: 2 cheese
        (5, 7, 1, 12.99, 12.99) # Order 5: 1 chicken
    ]
    
    cursor.executemany(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (%s, %s, %s, %s, %s)",
        order_items
    )
    
    print("✅ Sample data inserted successfully")

def main():
    """Main initialization function"""
    
    print("=== Render Database Initialization ===")
    print(f"Host: {db_config['host']}")
    print(f"Database: {db_config['database']}")
    print(f"User: {db_config['user']}")
    print()
    
    connection = None
    cursor = None
    
    try:
        print("Connecting to database...")
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        
        print("✅ Connected to database successfully")
        
        # Create tables
        print("\nCreating tables...")
        create_tables(cursor)
        
        # Insert sample data
        print("\nInserting sample data...")
        insert_sample_data(cursor)
        
        # Commit changes
        connection.commit()
        
        # Verify data
        cursor.execute("SELECT COUNT(*) FROM products")
        product_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM customers")
        customer_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM orders")
        order_count = cursor.fetchone()[0]
        
        print(f"\n✅ Database initialized successfully!")
        print(f"   - Products: {product_count}")
        print(f"   - Customers: {customer_count}")
        print(f"   - Orders: {order_count}")
        
        return True
        
    except Error as e:
        print(f"❌ Database error: {e}")
        if connection:
            connection.rollback()
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
        
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
            print("\nDatabase connection closed.")

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
