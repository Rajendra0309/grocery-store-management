from flask import Flask, render_template, request, redirect, url_for, jsonify
import mysql.connector
from mysql.connector import Error
import json
import os
from datetime import datetime, date
from contextlib import contextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import configuration based on environment
config_module = os.getenv('CONFIG_MODULE', 'config')
if config_module == 'config_docker':
    from config_docker import db_config
elif config_module == 'config_render':
    from config_render import db_config
else:
    from config import db_config

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-this-in-production')

# Template context processor to make current_date available in all templates
@app.context_processor
def inject_date():
    return {'current_date': datetime.now()}

# Database connection function with better error handling
def get_db_connection():
    """Get database connection with proper error handling and timeout"""
    try:
        # Add connection timeout and retry logic
        config = db_config.copy()
        config.update({
            'connection_timeout': 10,
            'autocommit': True,
            'use_unicode': True,
            'charset': 'utf8mb4'
        })
        connection = mysql.connector.connect(**config)
        return connection
    except Error as e:
        logger.error(f"Database connection error: {e}")
        raise Exception(f"Unable to connect to database: {e}")

@contextmanager
def get_db_cursor(dictionary=True):
    """Context manager for database operations with better error handling"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=dictionary)
        yield conn, cursor
    except Error as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

# Home page - Products list
@app.route('/')
def home():
    return render_template('home.html')

# Inventory Management page
@app.route('/inventory')
def inventory():
    return render_template('inventory.html')

# Products API endpoints
@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products with UOM information"""
    try:
        with get_db_cursor() as (conn, cursor):
            cursor.execute("""
                SELECT p.product_id, p.name, p.uom_id, p.price_per_unit, u.uom_name 
                FROM products p
                JOIN uom u ON p.uom_id = u.uom_id
                ORDER BY p.name
            """)
            products = cursor.fetchall()
            return jsonify(products)
    except Error as e:
        logger.error(f"Error fetching products: {e}")
        return jsonify({"error": "Failed to fetch products"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID"""
    try:
        with get_db_cursor() as (conn, cursor):
            cursor.execute("""
                SELECT p.product_id, p.name, p.uom_id, p.price_per_unit, u.uom_name 
                FROM products p
                JOIN uom u ON p.uom_id = u.uom_id
                WHERE p.product_id = %s
            """, (product_id,))
            product = cursor.fetchone()
            
            if product:
                return jsonify(product)
            return jsonify({"error": "Product not found"}), 404
    except Error as e:
        logger.error(f"Error fetching product {product_id}: {e}")
        return jsonify({"error": "Failed to fetch product"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/products', methods=['POST'])
def add_product():
    """Add a new product with validation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'uom_id', 'price_per_unit']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Validate data types
        try:
            uom_id = int(data['uom_id'])
            price_per_unit = float(data['price_per_unit'])
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid data types for uom_id or price_per_unit"}), 400
        
        # Validate price is positive
        if price_per_unit <= 0:
            return jsonify({"error": "Price must be greater than 0"}), 400
        
        # Validate product name length
        if len(data['name'].strip()) < 1 or len(data['name'].strip()) > 45:
            return jsonify({"error": "Product name must be between 1 and 45 characters"}), 400
        
        with get_db_cursor() as (conn, cursor):
            cursor.execute("""
                INSERT INTO products (name, uom_id, price_per_unit)
                VALUES (%s, %s, %s)
            """, (data['name'].strip(), uom_id, price_per_unit))
            conn.commit()
            product_id = cursor.lastrowid
            
            return jsonify({"product_id": product_id, "message": "Product added successfully"}), 201
            
    except mysql.connector.IntegrityError as e:
        logger.error(f"Integrity error adding product: {e}")
        return jsonify({"error": "Invalid UOM ID or duplicate product"}), 400
    except Error as e:
        logger.error(f"Database error adding product: {e}")
        return jsonify({"error": "Failed to add product"}), 500
    except Exception as e:
        logger.error(f"Unexpected error adding product: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update an existing product with validation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'uom_id', 'price_per_unit']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Validate data types
        try:
            uom_id = int(data['uom_id'])
            price_per_unit = float(data['price_per_unit'])
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid data types for uom_id or price_per_unit"}), 400
        
        # Validate price is positive
        if price_per_unit <= 0:
            return jsonify({"error": "Price must be greater than 0"}), 400
        
        # Validate product name length
        if len(data['name'].strip()) < 1 or len(data['name'].strip()) > 45:
            return jsonify({"error": "Product name must be between 1 and 45 characters"}), 400
        
        with get_db_cursor() as (conn, cursor):
            cursor.execute("""
                UPDATE products
                SET name = %s, uom_id = %s, price_per_unit = %s
                WHERE product_id = %s
            """, (data['name'].strip(), uom_id, price_per_unit, product_id))
            conn.commit()
            
            if cursor.rowcount > 0:
                return jsonify({"message": "Product updated successfully"})
            return jsonify({"error": "Product not found"}), 404
            
    except mysql.connector.IntegrityError as e:
        logger.error(f"Integrity error updating product: {e}")
        return jsonify({"error": "Invalid UOM ID"}), 400
    except Error as e:
        logger.error(f"Database error updating product: {e}")
        return jsonify({"error": "Failed to update product"}), 500
    except Exception as e:
        logger.error(f"Unexpected error updating product: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product with proper error handling"""
    try:
        with get_db_cursor() as (conn, cursor):
            # First check if product exists
            cursor.execute("SELECT name FROM products WHERE product_id = %s", (product_id,))
            product = cursor.fetchone()
            
            if not product:
                return jsonify({"error": "Product not found"}), 404
            
            # Check if product exists in orders (referential integrity)
            cursor.execute("""
                SELECT COUNT(*) as count FROM order_details WHERE product_id = %s
            """, (product_id,))
            result = cursor.fetchone()
            
            if result['count'] > 0:
                return jsonify({
                    "error": "Cannot delete product. It is referenced in existing orders.",
                    "details": f"Product '{product['name']}' cannot be deleted because it appears in {result['count']} existing order(s)."
                }), 400
            
            # Proceed with deletion
            cursor.execute("DELETE FROM products WHERE product_id = %s", (product_id,))
            conn.commit()
            
            if cursor.rowcount > 0:
                return jsonify({"message": f"Product '{product['name']}' deleted successfully"})
            else:
                return jsonify({"error": "Failed to delete product"}), 500
            
    except Error as e:
        logger.error(f"Database error deleting product {product_id}: {e}")
        return jsonify({"error": "Database error occurred while deleting product"}), 500
    except Exception as e:
        logger.error(f"Unexpected error deleting product {product_id}: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

# UOM API endpoints
@app.route('/api/uom', methods=['GET'])
def get_uom():
    """Get all units of measurement"""
    try:
        with get_db_cursor() as (conn, cursor):
            cursor.execute("SELECT * FROM uom ORDER BY uom_name")
            uom_list = cursor.fetchall()
            return jsonify(uom_list)
    except Error as e:
        logger.error(f"Error fetching UOM: {e}")
        return jsonify({"error": "Failed to fetch units of measurement"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

# Customers API endpoints
@app.route('/api/customers', methods=['GET'])
def get_customers():
    """Get all customers"""
    try:
        with get_db_cursor() as (conn, cursor):
            cursor.execute("SELECT * FROM customers ORDER BY name")
            customers = cursor.fetchall()
            return jsonify(customers)
    except Error as e:
        logger.error(f"Error fetching customers: {e}")
        return jsonify({"error": "Failed to fetch customers"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    """Get a specific customer by ID"""
    try:
        with get_db_cursor() as (conn, cursor):
            cursor.execute("SELECT * FROM customers WHERE customer_id = %s", (customer_id,))
            customer = cursor.fetchone()
            
            if customer:
                return jsonify(customer)
            return jsonify({"error": "Customer not found"}), 404
    except Error as e:
        logger.error(f"Error fetching customer {customer_id}: {e}")
        return jsonify({"error": "Failed to fetch customer"}), 500
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/customers', methods=['POST'])
def add_customer():
    """Add a new customer with validation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'name' not in data or not data['name']:
            return jsonify({"error": "Customer name is required"}), 400
        
        # Validate name length
        name = data['name'].strip()
        if len(name) < 1 or len(name) > 100:
            return jsonify({"error": "Customer name must be between 1 and 100 characters"}), 400
        
        # Validate optional fields
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()
        address = data.get('address', '').strip()
        
        # Validate phone number if provided
        if phone and (len(phone) < 10 or len(phone) > 15):
            return jsonify({"error": "Phone number must be between 10 and 15 characters"}), 400
        
        # Basic email validation if provided
        if email and ('@' not in email or len(email) > 100):
            return jsonify({"error": "Invalid email format or email too long"}), 400
        
        # Validate address length if provided
        if address and len(address) > 500:
            return jsonify({"error": "Address too long (max 500 characters)"}), 400
        
        with get_db_cursor() as (conn, cursor):
            cursor.execute("""
                INSERT INTO customers (name, phone, email, address)
                VALUES (%s, %s, %s, %s)
            """, (name, phone, email, address))
            conn.commit()
            customer_id = cursor.lastrowid
            
            return jsonify({"customer_id": customer_id, "message": "Customer added successfully"}), 201
            
    except Error as e:
        logger.error(f"Database error adding customer: {e}")
        return jsonify({"error": "Failed to add customer"}), 500
    except Exception as e:
        logger.error(f"Unexpected error adding customer: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE customers
            SET name = %s, phone = %s, email = %s, address = %s
            WHERE customer_id = %s
        """, (data['name'], data.get('phone', ''), data.get('email', ''), data.get('address', ''), customer_id))
        conn.commit()
        cursor.close()
        conn.close()
        if cursor.rowcount > 0:
            return jsonify({"message": "Customer updated successfully"})
        return jsonify({"error": "Customer not found"}), 404
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 400

@app.route('/api/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM customers WHERE customer_id = %s", (customer_id,))
        conn.commit()
        cursor.close()
        conn.close()
        if cursor.rowcount > 0:
            return jsonify({"message": "Customer deleted successfully"})
        return jsonify({"error": "Customer not found"}), 404
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 400

# Orders API endpoints
@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT o.order_id, o.customer_id, c.name as customer_name, o.total, o.datetime
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        ORDER BY o.datetime DESC
    """)
    orders = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(orders)

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Get order details
    cursor.execute("""
        SELECT o.order_id, o.customer_id, c.name as customer_name, o.total, o.datetime
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        WHERE o.order_id = %s
    """, (order_id,))
    order = cursor.fetchone()
    
    if not order:
        cursor.close()
        conn.close()
        return jsonify({"error": "Order not found"}), 404
    
    # Get order items
    cursor.execute("""
        SELECT od.product_id, p.name as product_name, od.quantity, u.uom_name, od.total_price
        FROM order_details od
        JOIN products p ON od.product_id = p.product_id
        JOIN uom u ON p.uom_id = u.uom_id
        WHERE od.order_id = %s
    """, (order_id,))
    order_items = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    # Combine order and items
    order['items'] = order_items
    return jsonify(order)

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Start transaction
        conn.start_transaction()
        
        # Insert order
        cursor.execute("""
            INSERT INTO orders (customer_id, total)
            VALUES (%s, %s)
        """, (data['customer_id'], data['total']))
        
        order_id = cursor.lastrowid
        
        # Insert order details
        for item in data['items']:
            cursor.execute("""
                INSERT INTO order_details (order_id, product_id, quantity, total_price)
                VALUES (%s, %s, %s, %s)
            """, (order_id, item['product_id'], item['quantity'], item['total_price']))
        
        # Commit transaction
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"order_id": order_id, "message": "Order created successfully"}), 201
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": str(e)}), 400

# Page routes
@app.route('/products')
def products_page():
    return render_template('products.html')

@app.route('/products/add')
def add_product_page():
    return render_template('add_product.html')

@app.route('/products/edit/<int:product_id>')
def edit_product_page(product_id):
    return render_template('edit_product.html', product_id=product_id)

@app.route('/customers')
def customers_page():
    return render_template('customers.html')

@app.route('/customers/add')
def add_customer_page():
    return render_template('add_customer.html')

@app.route('/customers/edit/<int:customer_id>')
def edit_customer_page(customer_id):
    return render_template('edit_customer.html', customer_id=customer_id)

@app.route('/orders')
def orders_page():
    return render_template('orders.html')

@app.route('/orders/<int:order_id>')
def order_details_page(order_id):
    return render_template('order_details.html', order_id=order_id)

@app.route('/orders/create')
def create_order_page():
    return render_template('create_order.html')

# Error handlers
# Dashboard API endpoints
@app.route('/api/orders/today')
def get_todays_orders():
    """Get today's orders count and revenue"""
    try:
        today = date.today()
        with get_db_cursor() as (conn, cursor):
            # Get today's orders count and total revenue
            cursor.execute("""
                SELECT COUNT(*) as order_count, COALESCE(SUM(total), 0) as revenue
                FROM orders 
                WHERE DATE(datetime) = %s
            """, (today,))
            result = cursor.fetchone()
            
            return jsonify({
                "count": result['order_count'],
                "revenue": float(result['revenue'])
            })
    except Error as e:
        logger.error(f"Database error getting today's orders: {e}")
        return jsonify({"error": "Failed to fetch today's data"}), 500
    except Exception as e:
        logger.error(f"Unexpected error getting today's orders: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/products/popular')
def get_popular_products():
    """Get popular products (all products for now, can be enhanced with sales data)"""
    try:
        with get_db_cursor() as (conn, cursor):
            cursor.execute("""
                SELECT p.product_id, p.name, p.price_per_unit, u.uom_name,
                       COALESCE(p.stock_quantity, 100) as stock_quantity
                FROM products p
                JOIN uom u ON p.uom_id = u.uom_id
                ORDER BY p.name
                LIMIT 20
            """)
            products = cursor.fetchall()
            
            # Convert Decimal to float for JSON serialization
            for product in products:
                product['price_per_unit'] = float(product['price_per_unit'])
            
            return jsonify(products)
    except Error as e:
        logger.error(f"Database error getting popular products: {e}")
        return jsonify({"error": "Failed to fetch popular products"}), 500
    except Exception as e:
        logger.error(f"Unexpected error getting popular products: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/orders/recent')
def get_recent_orders():
    """Get recent orders with customer names"""
    try:
        with get_db_cursor() as (conn, cursor):
            cursor.execute("""
                SELECT o.order_id, o.total, o.datetime, c.name as customer_name
                FROM orders o
                JOIN customers c ON o.customer_id = c.customer_id
                ORDER BY o.datetime DESC
                LIMIT 10
            """)
            orders = cursor.fetchall()
            
            # Convert datetime to string and decimal to float for JSON serialization
            for order in orders:
                if order['datetime']:
                    order['datetime'] = order['datetime'].isoformat()
                order['total'] = float(order['total'])
            
            return jsonify(orders)
    except Error as e:
        logger.error(f"Database error getting recent orders: {e}")
        return jsonify({"error": "Failed to fetch recent orders"}), 500
    except Exception as e:
        logger.error(f"Unexpected error getting recent orders: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

# Inventory Management API endpoints
@app.route('/api/inventory/summary')
def get_inventory_summary():
    """Get inventory summary statistics"""
    try:
        with get_db_cursor() as (conn, cursor):
            # Check if stock_quantity column exists
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'products' 
                AND COLUMN_NAME = 'stock_quantity'
                AND TABLE_SCHEMA = %s
            """, (db_config['database'],))
            
            has_stock_column = cursor.fetchone()['COUNT(*)'] > 0
            
            if not has_stock_column:
                # Add stock column if it doesn't exist
                cursor.execute("ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 100")
                cursor.execute("UPDATE products SET stock_quantity = FLOOR(RAND() * 150) + 10")
                conn.commit()
            
            # Get inventory statistics
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_products,
                    COUNT(CASE WHEN stock_quantity < 10 THEN 1 END) as low_stock_count,
                    COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock,
                    AVG(stock_quantity) as avg_stock,
                    SUM(price_per_unit * stock_quantity) as total_value
                FROM products
            """)
            
            result = cursor.fetchone()
            
            return jsonify({
                'total_products': result['total_products'],
                'low_stock_count': result['low_stock_count'],
                'out_of_stock': result['out_of_stock'],
                'avg_stock': round(float(result['avg_stock']) if result['avg_stock'] else 0, 2),
                'total_inventory_value': round(float(result['total_value']) if result['total_value'] else 0, 2)
            })
            
    except Error as e:
        logger.error(f"Database error getting inventory summary: {e}")
        return jsonify({"error": "Failed to fetch inventory summary"}), 500
    except Exception as e:
        logger.error(f"Unexpected error getting inventory summary: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/inventory/low-stock')
def get_low_stock_products():
    """Get products with low stock levels"""
    try:
        low_stock_threshold = request.args.get('threshold', 10, type=int)
        
        with get_db_cursor() as (conn, cursor):
            cursor.execute("""
                SELECT p.product_id, p.name, p.price_per_unit, 
                       COALESCE(p.stock_quantity, 100) as stock_quantity, u.uom_name
                FROM products p
                JOIN uom u ON p.uom_id = u.uom_id
                WHERE COALESCE(p.stock_quantity, 100) < %s
                ORDER BY COALESCE(p.stock_quantity, 100) ASC
            """, (low_stock_threshold,))
            
            products = cursor.fetchall()
            
            # Convert Decimal to float for JSON serialization
            for product in products:
                product['price_per_unit'] = float(product['price_per_unit'])
            
            return jsonify(products)
            
    except Error as e:
        logger.error(f"Database error getting low stock products: {e}")
        return jsonify({"error": "Failed to fetch low stock products"}), 500
    except Exception as e:
        logger.error(f"Unexpected error getting low stock products: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/inventory/update-stock', methods=['POST'])
def update_product_stock():
    """Update stock quantity for a product"""
    try:
        data = request.get_json()
        
        if 'product_id' not in data or 'stock_quantity' not in data:
            return jsonify({"error": "Missing product_id or stock_quantity"}), 400
        
        product_id = int(data['product_id'])
        stock_quantity = int(data['stock_quantity'])
        
        if stock_quantity < 0:
            return jsonify({"error": "Stock quantity cannot be negative"}), 400
        
        with get_db_cursor() as (conn, cursor):
            cursor.execute("""
                UPDATE products 
                SET stock_quantity = %s 
                WHERE product_id = %s
            """, (stock_quantity, product_id))
            
            if cursor.rowcount > 0:
                conn.commit()
                return jsonify({"message": "Stock updated successfully", "new_stock": stock_quantity})
            else:
                return jsonify({"error": "Product not found"}), 404
                
    except ValueError:
        return jsonify({"error": "Invalid data types"}), 400
    except Error as e:
        logger.error(f"Database error updating stock: {e}")
        return jsonify({"error": "Failed to update stock"}), 500
    except Exception as e:
        logger.error(f"Unexpected error updating stock: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/api/dashboard/stats')
def get_dashboard_stats():
    """Get comprehensive dashboard statistics"""
    try:
        with get_db_cursor() as (conn, cursor):
            stats = {}
            
            # Total products
            cursor.execute("SELECT COUNT(*) as count FROM products")
            stats['total_products'] = cursor.fetchone()['count']
            
            # Total customers
            cursor.execute("SELECT COUNT(*) as count FROM customers")
            stats['total_customers'] = cursor.fetchone()['count']
            
            # Total orders
            cursor.execute("SELECT COUNT(*) as count FROM orders")
            stats['total_orders'] = cursor.fetchone()['count']
            
            # Today's orders and revenue
            today = date.today()
            cursor.execute("""
                SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
                FROM orders 
                WHERE DATE(datetime) = %s
            """, (today,))
            today_data = cursor.fetchone()
            stats['today_orders'] = today_data['count']
            stats['today_revenue'] = float(today_data['revenue'])
            
            # This month's revenue
            cursor.execute("""
                SELECT COALESCE(SUM(total), 0) as revenue
                FROM orders 
                WHERE MONTH(datetime) = MONTH(CURRENT_DATE()) 
                AND YEAR(datetime) = YEAR(CURRENT_DATE())
            """)
            stats['month_revenue'] = float(cursor.fetchone()['revenue'])
            
            # Average order value
            cursor.execute("""
                SELECT COALESCE(AVG(total), 0) as avg_order
                FROM orders
            """)
            stats['avg_order_value'] = float(cursor.fetchone()['avg_order'])
            
            return jsonify(stats)
    except Error as e:
        logger.error(f"Database error getting dashboard stats: {e}")
        return jsonify({"error": "Failed to fetch dashboard statistics"}), 500
    except Exception as e:
        logger.error(f"Unexpected error getting dashboard stats: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('error.html', error_code=404, error_message="Page not found"), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('error.html', error_code=500, error_message="Internal server error"), 500

@app.errorhandler(403)
def forbidden_error(error):
    return render_template('error.html', error_code=403, error_message="Access forbidden"), 403

# Health check endpoint
@app.route('/health')
def health_check():
    try:
        # Basic app health
        response = {"status": "healthy", "app": "running"}
        
        # Test database connection
        try:
            with get_db_cursor() as (conn, cursor):
                cursor.execute("SELECT 1")
                cursor.fetchone()
            response["database"] = "connected"
        except Exception as db_error:
            logger.warning(f"Database health check failed: {db_error}")
            response["database"] = "disconnected"
            response["db_error"] = str(db_error)
            
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

# Simple root endpoint for testing
@app.route('/test')
def test_endpoint():
    return jsonify({"message": "App is working!", "timestamp": datetime.now().isoformat()})

# Database setup endpoint for manual initialization
@app.route('/setup-db')
def setup_database():
    """Manual database setup endpoint"""
    try:
        # Import the initialization function
        import subprocess
        import sys
        
        # Run the database initialization script
        result = subprocess.run([sys.executable, 'init_render_db.py'], 
                               capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            return jsonify({
                "status": "success",
                "message": "Database initialized successfully",
                "output": result.stdout
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Database initialization failed",
                "error": result.stderr,
                "output": result.stdout
            }), 500
            
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to run database setup",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Production configuration for Render deployment
    host = os.getenv('HOST', '0.0.0.0')  # Changed to 0.0.0.0 for production
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'  # Default to False for production
    app.run(host=host, port=port, debug=debug)