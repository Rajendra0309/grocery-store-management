// Orders page functionality

// Load orders with enhanced error handling
async function loadOrders() {
    await loadData('/api/orders', 'ordersContainer', renderOrders);
}

// Enhanced render orders list with better styling
function renderOrders(orders) {
    if (!orders || orders.length === 0) {
        return `
            <div class="empty-state text-center py-5">
                <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
                <h4>No Orders Found</h4>
                <p class="text-muted">Start taking orders from your customers.</p>
                <a href="/orders/create" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Create First Order
                </a>
            </div>
        `;
    }
    
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    
    let html = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h3><i class="fas fa-shopping-cart me-2"></i>Orders (${orders.length})</h3>
                <p class="text-muted">Total Revenue: ${formatCurrency(totalRevenue)}</p>
            </div>
            <div class="btn-group">
                <a href="/orders/create" class="btn btn-success">
                    <i class="fas fa-plus"></i> New Order
                </a>
                <button class="btn btn-info" onclick="exportOrders()">
                    <i class="fas fa-download"></i> Export
                </button>
                <button class="btn btn-secondary" onclick="loadOrders()">
                    <i class="fas fa-refresh"></i> Refresh
                </button>
            </div>
        </div>
        
        <div class="card">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th><i class="fas fa-hashtag"></i> Order ID</th>
                                <th><i class="fas fa-user"></i> Customer</th>
                                <th><i class="fas fa-calendar"></i> Date</th>
                                <th><i class="fas fa-rupee-sign"></i> Total</th>
                                <th><i class="fas fa-chart-line"></i> Status</th>
                                <th><i class="fas fa-cogs"></i> Actions</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    orders.forEach(order => {
        const date = new Date(order.datetime);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const isRecent = (new Date() - date) < (24 * 60 * 60 * 1000); // Less than 24 hours
        
        html += `
            <tr data-order-id="${order.order_id}" ${isRecent ? 'class="table-success"' : ''}>
                <td>
                    <strong>#${order.order_id}</strong>
                    ${isRecent ? '<span class="badge bg-success ms-2">New</span>' : ''}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="customer-icon me-2">
                            <i class="fas fa-user-circle text-primary"></i>
                        </div>
                        <div>
                            <strong>${order.customer_name}</strong>
                        </div>
                    </div>
                </td>
                <td>
                    <div>
                        <strong>${formattedDate}</strong>
                        <small class="text-muted d-block">${formattedTime}</small>
                    </div>
                </td>
                <td>
                    <strong class="text-success">${formatCurrency(order.total)}</strong>
                </td>
                <td>
                    <span class="badge bg-success">Completed</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <a href="/orders/${order.order_id}" 
                           class="btn btn-outline-primary" 
                           title="View Details">
                            <i class="fas fa-eye"></i>
                        </a>
                        <button onclick="printOrder(${order.order_id})" 
                                class="btn btn-outline-info" 
                                title="Print Order">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="mt-3 text-muted">
            <small>
                <i class="fas fa-info-circle"></i> 
                Total Orders: ${orders.length} | 
                Total Revenue: ${formatCurrency(totalRevenue)} |
                Average Order: ${formatCurrency(totalRevenue / orders.length)}
            </small>
        </div>
    `;
    
    return html;
}

// Load order details
async function loadOrderDetails(orderId) {
    try {
        const order = await apiRequest(`/api/orders/${orderId}`);
        renderOrderDetails(order);
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Render order details
function renderOrderDetails(order) {
    const date = new Date(order.datetime).toLocaleString();
    
    // Order summary
    let summaryHtml = `
        <div class="card mb-4">
            <div class="card-header">Order Summary</div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Order ID:</strong> ${order.order_id}</p>
                        <p><strong>Customer:</strong> ${order.customer_name}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Total:</strong> <span class="order-total">${formatCurrency(order.total)}</span></p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('orderSummary').innerHTML = summaryHtml;
    
    // Order items
    let itemsHtml = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Unit</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    order.items.forEach(item => {
        itemsHtml += `
            <tr>
                <td>${item.product_name}</td>
                <td>${item.uom_name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.total_price)}</td>
            </tr>
        `;
    });
    
    itemsHtml += `
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="3" class="text-end">Total:</th>
                        <th>${formatCurrency(order.total)}</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    document.getElementById('orderItems').innerHTML = itemsHtml;
}

// Create Order functionality
let orderItems = [];
let products = [];

// Load data for order creation
async function initOrderCreation() {
    try {
        // Load customers
        const customers = await apiRequest('/api/customers');
        const customerSelect = document.getElementById('customerId');
        
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.customer_id;
            option.textContent = customer.name;
            customerSelect.appendChild(option);
        });
        
        // Load products
        products = await apiRequest('/api/products');
        const productSelect = document.getElementById('productId');
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.product_id;
            option.textContent = `${product.name} (${formatCurrency(product.price_per_unit)} per ${product.uom_name})`;
            productSelect.appendChild(option);
        });
        
        // Set up event listeners
        document.getElementById('productId').addEventListener('change', updateProductDetails);
        document.getElementById('addItemBtn').addEventListener('click', addItemToOrder);
        document.getElementById('createOrderForm').addEventListener('submit', submitOrder);
        
        updateProductDetails();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Update product details when product selection changes
function updateProductDetails() {
    const productId = parseInt(document.getElementById('productId').value);
    const product = products.find(p => p.product_id === productId);
    
    if (product) {
        document.getElementById('unitPrice').value = product.price_per_unit;
        document.getElementById('unitLabel').textContent = product.uom_name;
    }
}

// Calculate item total price
function calculateItemTotal() {
    const quantity = parseFloat(document.getElementById('quantity').value) || 0;
    const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
    return quantity * unitPrice;
}

// Add item to order
function addItemToOrder() {
    const productId = parseInt(document.getElementById('productId').value);
    const product = products.find(p => p.product_id === productId);
    const quantity = parseFloat(document.getElementById('quantity').value);
    
    if (!product || isNaN(quantity) || quantity <= 0) {
        showAlert('Please select a product and enter a valid quantity', 'warning');
        return;
    }
    
    const totalPrice = calculateItemTotal();
    
    // Check if product already in order
    const existingItemIndex = orderItems.findIndex(item => item.product_id === productId);
    
    if (existingItemIndex >= 0) {
        // Update existing item
        orderItems[existingItemIndex].quantity = quantity;
        orderItems[existingItemIndex].total_price = totalPrice;
    } else {
        // Add new item
        orderItems.push({
            product_id: productId,
            product_name: product.name,
            uom_name: product.uom_name,
            quantity: quantity,
            unit_price: product.price_per_unit,
            total_price: totalPrice
        });
    }
    
    updateOrderSummary();
    resetItemForm();
}

// Update order summary
function updateOrderSummary() {
    const orderTotal = calculateOrderTotal(orderItems);
    document.getElementById('orderTotal').textContent = formatCurrency(orderTotal);
    
    let itemsHtml = '';
    
    if (orderItems.length === 0) {
        itemsHtml = '<p class="text-muted">No items added to order yet.</p>';
    } else {
        itemsHtml = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        orderItems.forEach((item, index) => {
            itemsHtml += `
                <tr>
                    <td>${item.product_name}</td>
                    <td>${item.quantity} ${item.uom_name}</td>
                    <td>${formatCurrency(item.total_price)}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeOrderItem(${index})">
                            Remove
                        </button>
                    </td>
                </tr>
            `;
        });
        
        itemsHtml += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="2" class="text-end">Total:</th>
                            <th colspan="2">${formatCurrency(orderTotal)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
    }
    
    document.getElementById('orderItemsList').innerHTML = itemsHtml;
    
    // Enable/disable submit button
    document.getElementById('submitOrderBtn').disabled = orderItems.length === 0;
}

// Reset item form
function resetItemForm() {
    document.getElementById('quantity').value = '1';
    updateProductDetails();
}

// Remove item from order
function removeOrderItem(index) {
    orderItems.splice(index, 1);
    updateOrderSummary();
}

// Submit order
async function submitOrder(event) {
    event.preventDefault();
    
    if (orderItems.length === 0) {
        showAlert('Please add at least one item to the order', 'warning');
        return;
    }
    
    const customerId = parseInt(document.getElementById('customerId').value);
    const orderTotal = calculateOrderTotal(orderItems);
    
    const orderData = {
        customer_id: customerId,
        total: orderTotal,
        items: orderItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            total_price: item.total_price
        }))
    };
    
    try {
        const result = await apiRequest('/api/orders', 'POST', orderData);
        showAlert('Order created successfully!');
        window.location.href = `/orders/${result.order_id}`;
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Initialize orders page
function initOrdersPage() {
    loadOrders();
}

// Export orders to CSV
function exportOrders() {
    apiRequest('/api/orders')
        .then(orders => {
            const csvData = orders.map(order => ({
                'Order ID': order.order_id,
                'Customer': order.customer_name,
                'Date': new Date(order.datetime).toLocaleString(),
                'Total': order.total
            }));
            
            downloadCSV(csvData, 'orders-export.csv');
            showAlert('Orders exported successfully!', 'success');
        })
        .catch(error => {
            showAlert(`Export failed: ${error.message}`, 'error');
        });
}

// Print order receipt
async function printOrder(orderId) {
    try {
        const order = await apiRequest(`/api/orders/${orderId}`);
        const printWindow = window.open('', '_blank');
        
        const receiptHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order Receipt #${order.order_id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                    .order-info { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total { font-weight: bold; font-size: 1.2em; }
                    .footer { text-align: center; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Grocery Store</h1>
                    <h2>Order Receipt</h2>
                </div>
                
                <div class="order-info">
                    <p><strong>Order ID:</strong> #${order.order_id}</p>
                    <p><strong>Customer:</strong> ${order.customer_name}</p>
                    <p><strong>Date:</strong> ${new Date(order.datetime).toLocaleString()}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Unit</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>${item.uom_name}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.total_price)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total">
                            <td colspan="3">Total:</td>
                            <td>${formatCurrency(order.total)}</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p><small>Generated on ${new Date().toLocaleString()}</small></p>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        
    } catch (error) {
        showAlert(`Failed to print order: ${error.message}`, 'error');
    }
}

// CSV download helper functions
function downloadCSV(data, filename) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function convertToCSV(objArray) {
    const array = [Object.keys(objArray[0])].concat(objArray);
    return array.map(it => Object.values(it).toString()).join('\n');
}