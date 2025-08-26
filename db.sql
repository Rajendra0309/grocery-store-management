-- Create database
CREATE DATABASE IF NOT EXISTS grocery_store;
USE grocery_store;

-- Create tables
CREATE TABLE IF NOT EXISTS uom (
    uom_id INT AUTO_INCREMENT PRIMARY KEY,
    uom_name VARCHAR(45) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(45) NOT NULL,
    uom_id INT NOT NULL,
    price_per_unit DOUBLE NOT NULL,
    FOREIGN KEY (uom_id) REFERENCES uom(uom_id)
);

CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    address TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    total DOUBLE NOT NULL,
    datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE IF NOT EXISTS order_details (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity DOUBLE NOT NULL,
    total_price DOUBLE NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Insert sample data
-- Units of Measurement
INSERT INTO uom (uom_name) VALUES
('Kg'),
('Liter'),
('Piece'),
('Pack'),
('Dozen');

-- Products with realistic Indian Rupee prices
INSERT INTO products (name, uom_id, price_per_unit) VALUES
-- Grains and Cereals
('Basmati Rice', 1, 120.00),       -- ₹120/kg (premium basmati)
('Brown Rice', 1, 80.00),          -- ₹80/kg  
('White Rice', 1, 60.00),          -- ₹60/kg
('Wheat Flour', 1, 45.00),         -- ₹45/kg
('Oats', 1, 150.00),              -- ₹150/kg
('Quinoa', 1, 800.00),            -- ₹800/kg (imported)
('Barley', 1, 70.00),             -- ₹70/kg

-- Dairy Products
('Whole Milk', 2, 60.00),         -- ₹60/L
('Skim Milk', 2, 65.00),          -- ₹65/L
('Almond Milk', 2, 250.00),       -- ₹250/L (premium)
('Greek Yogurt', 3, 180.00),      -- ₹180/piece
('Cheddar Cheese', 1, 400.00),    -- ₹400/kg
('Mozzarella Cheese', 1, 350.00), -- ₹350/kg
('Butter', 1, 500.00),            -- ₹500/kg
('Heavy Cream', 2, 150.00),       -- ₹150/L

-- Meat and Poultry
('Chicken Breast', 1, 300.00),    -- ₹300/kg
('Ground Beef', 1, 450.00),       -- ₹450/kg (mutton substitute)
('Pork Chops', 1, 400.00),        -- ₹400/kg
('Salmon Fillet', 1, 1200.00),    -- ₹1200/kg (imported)
('Turkey Slices', 1, 600.00),     -- ₹600/kg
('Bacon', 1, 800.00),             -- ₹800/kg

-- Vegetables
('Fresh Tomatoes', 1, 40.00),     -- ₹40/kg
('Red Onions', 1, 30.00),         -- ₹30/kg
('Yellow Onions', 1, 25.00),      -- ₹25/kg
('Carrots', 1, 50.00),            -- ₹50/kg
('Potatoes', 1, 25.00),           -- ₹25/kg
('Sweet Potatoes', 1, 60.00),     -- ₹60/kg
('Bell Peppers', 1, 80.00),       -- ₹80/kg
('Broccoli', 1, 120.00),          -- ₹120/kg
('Spinach', 1, 30.00),            -- ₹30/kg
('Lettuce', 3, 40.00),            -- ₹40/piece
('Cucumbers', 1, 35.00),          -- ₹35/kg
('Garlic', 1, 200.00),            -- ₹200/kg

-- Fruits
('Bananas', 1, 50.00),            -- ₹50/kg
('Apples', 1, 150.00),            -- ₹150/kg (kashmir/imported)
('Oranges', 1, 60.00),            -- ₹60/kg
('Strawberries', 1, 300.00),      -- ₹300/kg
('Grapes', 1, 100.00),            -- ₹100/kg
('Avocados', 3, 150.00),          -- ₹150/piece (imported)
('Lemons', 1, 80.00),             -- ₹80/kg
('Limes', 1, 100.00),             -- ₹100/kg
('Mangoes', 3, 80.00),            -- ₹80/piece (alphonso season)
('Pineapple', 3, 60.00),          -- ₹60/piece

-- Beverages
('Orange Juice', 2, 120.00),      -- ₹120/L
('Apple Juice', 2, 150.00),       -- ₹150/L
('Coffee Beans', 1, 800.00),      -- ₹800/kg (arabica)
('Green Tea', 4, 300.00),         -- ₹300/pack
('Sparkling Water', 2, 40.00),    -- ₹40/L
('Coconut Water', 2, 30.00),      -- ₹30/L (fresh)

-- Pantry Items
('Olive Oil', 2, 600.00),         -- ₹600/L (extra virgin)
('Vegetable Oil', 2, 120.00),     -- ₹120/L (sunflower)
('Pasta', 4, 80.00),              -- ₹80/pack
('Spaghetti', 4, 120.00),         -- ₹120/pack
('Canned Tomatoes', 3, 60.00),    -- ₹60/piece
('Black Beans', 3, 80.00),        -- ₹80/piece (rajma)
('Chickpeas', 3, 100.00),         -- ₹100/piece (chana)
('Peanut Butter', 3, 350.00),     -- ₹350/piece
('Honey', 3, 400.00),             -- ₹400/piece (natural)
('Salt', 3, 20.00),               -- ₹20/piece
('Black Pepper', 3, 800.00),      -- ₹800/piece (whole)
('Garlic Powder', 3, 150.00),     -- ₹150/piece

-- Bakery Items
('White Bread', 3, 25.00),        -- ₹25/piece (pav/slice bread)
('Whole Wheat Bread', 3, 30.00),  -- ₹30/piece
('Bagels', 4, 200.00),            -- ₹200/pack
('Croissants', 4, 300.00),        -- ₹300/pack
('Dinner Rolls', 4, 150.00),      -- ₹150/pack

-- Frozen Items
('Frozen Pizza', 3, 250.00),      -- ₹250/piece
('Ice Cream', 2, 300.00),         -- ₹300/L (premium)
('Frozen Vegetables', 4, 120.00), -- ₹120/pack
('Frozen Berries', 4, 400.00),    -- ₹400/pack (imported)

-- Snacks and Treats
('Potato Chips', 4, 50.00),       -- ₹50/pack
('Chocolate Bars', 3, 80.00),     -- ₹80/piece
('Cookies', 4, 150.00),           -- ₹150/pack
('Nuts Mix', 4, 600.00),          -- ₹600/pack (dry fruits)
('Crackers', 4, 100.00),          -- ₹100/pack

-- Eggs and Protein
('Large Eggs', 5, 120.00),        -- ₹120/dozen
('Organic Eggs', 5, 200.00),      -- ₹200/dozen
('Tofu', 3, 120.00),              -- ₹120/piece

-- Household Items
('Paper Towels', 4, 200.00),      -- ₹200/pack
('Toilet Paper', 4, 300.00),      -- ₹300/pack
('Dish Soap', 3, 80.00),          -- ₹80/piece
('Laundry Detergent', 3, 250.00); -- ₹250/piece

-- Customers with diverse backgrounds
INSERT INTO customers (name, phone, email, address) VALUES
('John Smith', '555-123-4567', 'john.smith@email.com', '123 Main Street, Springfield, IL 62701'),
('Jane Doe', '555-987-6543', 'jane.doe@email.com', '456 Oak Avenue, Madison, WI 53703'),
('Robert Johnson', '555-456-7890', 'robert.j@email.com', '789 Pine Road, Austin, TX 78701'),
('Sarah Williams', '555-789-0123', 'sarah.williams@email.com', '321 Elm Street, Portland, OR 97201'),
('Michael Brown', '555-234-5678', 'michael.brown@email.com', '654 Maple Drive, Denver, CO 80202'),
('Emily Davis', '555-345-6789', 'emily.davis@email.com', '987 Cedar Lane, Seattle, WA 98101'),
('David Wilson', '555-567-8901', 'david.wilson@email.com', '246 Birch Street, Boston, MA 02101'),
('Lisa Garcia', '555-678-9012', 'lisa.garcia@email.com', '135 Willow Court, Phoenix, AZ 85001'),
('James Martinez', '555-789-0124', 'james.martinez@email.com', '579 Spruce Avenue, Miami, FL 33101'),
('Ashley Rodriguez', '555-890-1235', 'ashley.rodriguez@email.com', '864 Fir Drive, Nashville, TN 37201'),
('Christopher Lee', '555-901-2346', 'chris.lee@email.com', '753 Ash Boulevard, San Diego, CA 92101'),
('Amanda Taylor', '555-012-3457', 'amanda.taylor@email.com', '951 Hickory Lane, Charlotte, NC 28201'),
('Matthew Anderson', '555-123-4568', 'matt.anderson@email.com', '357 Poplar Street, Minneapolis, MN 55401'),
('Jessica Thomas', '555-234-5679', 'jessica.thomas@email.com', '468 Sycamore Road, Atlanta, GA 30301'),
('Daniel Jackson', '555-345-6780', 'daniel.jackson@email.com', '159 Walnut Avenue, Kansas City, MO 64101'),
('Rachel White', '555-456-7891', 'rachel.white@email.com', '753 Chestnut Drive, Pittsburgh, PA 15201'),
('Kevin Harris', '555-567-8902', 'kevin.harris@email.com', '852 Beech Court, Cleveland, OH 44101'),
('Stephanie Clark', '555-678-9013', 'stephanie.clark@email.com', '963 Magnolia Lane, New Orleans, LA 70112'),
('Ryan Lewis', '555-789-0125', 'ryan.lewis@email.com', '741 Cypress Street, Salt Lake City, UT 84101'),
('Nicole Walker', '555-890-1236', 'nicole.walker@email.com', '582 Redwood Avenue, San Francisco, CA 94101'),
('Brandon Hall', '555-901-2347', 'brandon.hall@email.com', '396 Dogwood Drive, Richmond, VA 23219'),
('Megan Allen', '555-012-3458', 'megan.allen@email.com', '174 Juniper Road, Milwaukee, WI 53202'),
('Justin Young', '555-123-4569', 'justin.young@email.com', '685 Elm Park Way, Las Vegas, NV 89101'),
('Kimberly King', '555-234-5680', 'kimberly.king@email.com', '297 Pine Valley Circle, Phoenix, AZ 85003'),
('Andrew Wright', '555-345-6781', 'andrew.wright@email.com', '418 Oak Hill Drive, Raleigh, NC 27601'),
('Laura Lopez', '555-456-7892', 'laura.lopez@email.com', '529 Maple Grove Lane, Orlando, FL 32801'),
('Eric Hill', '555-567-8903', 'eric.hill@email.com', '630 Cedar Ridge Road, Tampa, FL 33601'),
('Samantha Scott', '555-678-9014', 'samantha.scott@email.com', '741 Birch Creek Drive, Jacksonville, FL 32202'),
('Tyler Green', '555-789-0126', 'tyler.green@email.com', '852 Willow Springs Court, Memphis, TN 38101'),
('Brittany Adams', '555-890-1237', 'brittany.adams@email.com', '963 Spruce Meadow Lane, Louisville, KY 40202');

-- Sample Orders with updated pricing
INSERT INTO orders (customer_id, total, datetime) VALUES
(1, 34.85, '2025-08-20 10:30:00'),
(2, 67.42, '2025-08-21 14:45:00'),
(3, 23.96, '2025-08-22 16:20:00'),
(4, 89.73, '2025-08-23 09:15:00'),
(5, 45.67, '2025-08-24 11:30:00'),
(6, 52.18, '2025-08-25 13:45:00'),
(7, 38.29, '2025-08-25 15:20:00'),
(8, 71.84, '2025-08-26 08:15:00');

-- Order Details with realistic quantities and updated pricing
INSERT INTO order_details (order_id, product_id, quantity, total_price) VALUES
-- Order 1: John Smith - Basic grocery shopping
(1, 1, 2, 9.98),    -- Basmati Rice (2 kg)
(1, 8, 1, 3.49),    -- Whole Milk (1 L)
(1, 56, 1, 2.99),   -- White Bread
(1, 68, 1, 3.99),   -- Large Eggs
(1, 23, 1, 2.99),   -- Fresh Tomatoes
(1, 33, 2, 2.58),   -- Bananas (2 kg)
(1, 48, 1, 7.99),   -- Olive Oil

-- Order 2: Jane Doe - Family weekly shopping
(2, 2, 1, 3.49),    -- Brown Rice
(2, 16, 2, 13.98),  -- Chicken Breast (2 kg)
(2, 25, 1, 2.49),   -- Potatoes
(2, 28, 1, 2.79),   -- Broccoli
(2, 34, 3, 11.97),  -- Apples (3 kg)
(2, 8, 2, 6.98),    -- Whole Milk (2 L)
(2, 43, 1, 4.49),   -- Orange Juice
(2, 51, 2, 3.98),   -- Pasta (2 packs)
(2, 62, 1, 5.99),   -- Frozen Pizza
(2, 69, 1, 3.99),   -- Organic Eggs
(2, 73, 1, 8.99),   -- Paper Towels
(2, 12, 1, 5.99),   -- Cheddar Cheese

-- Order 3: Robert Johnson - Quick dinner items
(3, 50, 1, 1.99),   -- Pasta
(3, 53, 1, 1.79),   -- Canned Tomatoes
(3, 13, 1, 5.49),   -- Mozzarella Cheese
(3, 32, 1, 1.99),   -- Garlic
(3, 47, 1, 3.49),   -- Black Pepper
(3, 49, 1, 7.99),   -- Olive Oil
(3, 9, 1, 3.29),    -- Skim Milk

-- Order 4: Sarah Williams - Health-conscious shopping
(4, 6, 1, 8.99),    -- Quinoa
(4, 10, 2, 11.98),  -- Greek Yogurt (2 containers)
(4, 29, 2, 7.98),   -- Spinach (2 kg)
(4, 37, 1, 4.99),   -- Strawberries
(4, 39, 3, 5.97),   -- Avocados (3 pieces)
(4, 70, 1, 3.99),   -- Tofu
(4, 18, 1, 12.99),  -- Salmon Fillet
(4, 45, 1, 12.99),  -- Coffee Beans
(4, 57, 1, 3.49),   -- Whole Wheat Bread
(4, 56, 1, 6.99),   -- Honey
(4, 11, 1, 4.49),   -- Almond Milk

-- Order 5: Michael Brown - Household essentials
(5, 74, 1, 12.99),  -- Toilet Paper
(5, 75, 1, 2.99),   -- Dish Soap
(5, 76, 1, 9.99),   -- Laundry Detergent
(5, 8, 1, 3.49),    -- Whole Milk
(5, 56, 1, 2.99),   -- White Bread
(5, 68, 1, 3.99),   -- Large Eggs
(5, 25, 2, 4.98),   -- Potatoes (2 kg)
(5, 65, 1, 3.99),   -- Potato Chips

-- Order 6: Emily Davis - Baking supplies
(6, 4, 1, 1.89),    -- Wheat Flour
(6, 14, 1, 4.29),   -- Butter
(6, 68, 2, 7.98),   -- Large Eggs (2 dozen)
(6, 8, 1, 3.49),    -- Whole Milk
(6, 56, 1, 6.99),   -- Honey
(6, 66, 1, 2.49),   -- Chocolate Bars
(6, 59, 1, 5.99),   -- Croissants
(6, 35, 1, 2.49),   -- Oranges
(6, 40, 1, 2.99),   -- Lemons
(6, 15, 1, 2.99),   -- Heavy Cream

-- Order 7: David Wilson - Snack and beverages
(7, 43, 1, 4.49),   -- Orange Juice
(7, 44, 1, 3.99),   -- Apple Juice
(7, 47, 1, 2.49),   -- Sparkling Water
(7, 65, 2, 7.98),   -- Potato Chips (2 packs)
(7, 67, 1, 4.49),   -- Cookies
(7, 68, 1, 7.99),   -- Nuts Mix
(7, 66, 3, 7.47),   -- Chocolate Bars (3 pieces)
(7, 33, 1, 1.29),   -- Bananas

-- Order 8: Lisa Garcia - International cuisine ingredients
(8, 1, 1, 4.99),    -- Basmati Rice
(8, 48, 1, 7.99),   -- Olive Oil
(8, 32, 1, 4.99),   -- Garlic
(8, 24, 1, 1.49),   -- Red Onions
(8, 53, 2, 3.58),   -- Canned Tomatoes (2 cans)
(8, 54, 1, 1.49),   -- Black Beans
(8, 55, 1, 1.89),   -- Chickpeas
(8, 27, 1, 3.49),   -- Bell Peppers
(8, 46, 1, 8.49),   -- Green Tea
(8, 16, 1, 7.99),   -- Chicken Breast
(8, 41, 1, 2.49),   -- Mangoes
(8, 20, 1, 9.49),   -- Turkey Slices
(8, 69, 1, 3.49);   -- Crackers