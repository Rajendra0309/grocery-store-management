// Products page functionality

// Load products with enhanced error handling
async function loadProducts() {
    await loadData('/api/products', 'productsContainer', renderProducts);
}

// Enhanced render products list with better styling
function renderProducts(products) {
    if (!products || products.length === 0) {
        return `
            <div class="empty-state text-center py-5">
                <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
                <h4>No Products Found</h4>
                <p class="text-muted">Get started by adding your first product to the inventory.</p>
                <a href="/products/add" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add First Product
                </a>
            </div>
        `;
    }
    
    let html = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h3><i class="fas fa-boxes me-2"></i>Products (${products.length})</h3>
                <p class="text-muted">Manage your product inventory</p>
            </div>
            <div class="btn-group">
                <a href="/products/add" class="btn btn-success">
                    <i class="fas fa-plus"></i> Add Product
                </a>
                <button class="btn btn-info" onclick="exportProducts()">
                    <i class="fas fa-download"></i> Export
                </button>
                <button class="btn btn-secondary" onclick="loadProducts()">
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
                                <th><i class="fas fa-hashtag"></i> ID</th>
                                <th><i class="fas fa-tag"></i> Name</th>
                                <th><i class="fas fa-ruler"></i> Unit</th>
                                <th><i class="fas fa-rupee-sign"></i> Price</th>
                                <th><i class="fas fa-boxes"></i> Stock</th>
                                <th><i class="fas fa-chart-line"></i> Value</th>
                                <th><i class="fas fa-cogs"></i> Actions</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    products.forEach(product => {
        const stock = product.stock_quantity || 100;
        const stockValue = stock * product.price_per_unit;
        const stockStatus = getStockStatus(stock);
        const statusClass = getStatusClass(stock);
        
        html += `
            <tr data-product-id="${product.product_id}">
                <td><strong>#${product.product_id}</strong></td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="product-icon me-2">
                            <i class="fas fa-cube text-primary"></i>
                        </div>
                        <div>
                            <strong>${product.name}</strong>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary">${product.uom_name}</span>
                </td>
                <td>
                    <strong class="text-success">${formatCurrency(product.price_per_unit)}</strong>
                </td>
                <td>
                    <span class="badge bg-${statusClass}">${stock}</span>
                    <small class="text-muted d-block">${stockStatus}</small>
                </td>
                <td>
                    <strong>${formatCurrency(stockValue)}</strong>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <a href="/products/edit/${product.product_id}" 
                           class="btn btn-outline-primary" 
                           title="Edit Product">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button onclick="deleteProduct(${product.product_id}, '${product.name}')" 
                                class="btn btn-outline-danger" 
                                title="Delete Product">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="viewProductDetails(${product.product_id})" 
                                class="btn btn-outline-info" 
                                title="View Details">
                            <i class="fas fa-eye"></i>
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
                Total Products: ${products.length} | 
                Total Inventory Value: ${formatCurrency(products.reduce((sum, p) => sum + ((p.stock_quantity || 100) * p.price_per_unit), 0))}
            </small>
        </div>
    `;
    
    return html;
}

// Enhanced delete product with better confirmation
async function deleteProduct(productId, productName) {
    const message = `This will permanently delete "${productName}" from your inventory. This action cannot be undone.`;
    
    confirmDelete(message, async () => {
        try {
            showAlert('Deleting product...', 'info');
            
            // Use fetch directly to avoid double error alerts
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                // Handle specific error cases
                if (result.error && result.error.includes('referenced in existing orders')) {
                    // Show a more detailed modal for products that can't be deleted
                    showProductCannotDeleteModal(productName, result.details || result.error);
                    return;
                } else {
                    showAlert(`Failed to delete "${productName}": ${result.error || 'Unknown error'}`, 'error');
                    return;
                }
            }
            
            // Success - animate row removal
            const row = document.querySelector(`tr[data-product-id="${productId}"]`);
            if (row) {
                row.style.transition = 'all 0.3s ease';
                row.style.backgroundColor = '#ffebee';
                row.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    row.remove();
                }, 300);
            }
            
            showAlert(`Product "${productName}" deleted successfully!`, 'success');
            
            // Reload products to update counts
            setTimeout(() => loadProducts(), 1000);
            
        } catch (error) {
            console.error('Delete error:', error);
            showAlert(`Failed to delete "${productName}": ${error.message}`, 'error');
        }
    }, {
        title: 'Delete Product?',
        confirmButtonText: 'Yes, Delete Product',
        icon: 'error'
    });
}

// View product details in modal
async function viewProductDetails(productId) {
    try {
        const product = await apiRequest(`/api/products/${productId}`);
        const stock = product.stock_quantity || 100;
        
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-cube me-2"></i>Product Details
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2 text-muted">Basic Information</h6>
                                        <p><strong>ID:</strong> #${product.product_id}</p>
                                        <p><strong>Name:</strong> ${product.name}</p>
                                        <p><strong>Unit:</strong> ${product.uom_name}</p>
                                        <p><strong>Price:</strong> ${formatCurrency(product.price_per_unit)}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2 text-muted">Inventory Information</h6>
                                        <p><strong>Stock:</strong> <span class="badge bg-${getStatusClass(stock)}">${stock} ${product.uom_name}</span></p>
                                        <p><strong>Status:</strong> ${getStockStatus(stock)}</p>
                                        <p><strong>Stock Value:</strong> ${formatCurrency(stock * product.price_per_unit)}</p>
                                        <hr>
                                        <div class="d-grid gap-2">
                                            <a href="/products/edit/${product.product_id}" class="btn btn-primary btn-sm">
                                                <i class="fas fa-edit"></i> Edit Product
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Clean up modal after hiding
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
        
    } catch (error) {
        showAlert(`Failed to load product details: ${error.message}`, 'error');
    }
}

// Export products to CSV
function exportProducts() {
    apiRequest('/api/products')
        .then(products => {
            const csvData = products.map(product => ({
                'Product ID': product.product_id,
                'Name': product.name,
                'Unit of Measure': product.uom_name,
                'Price per Unit': product.price_per_unit,
                'Stock Quantity': product.stock_quantity || 100,
                'Stock Value': (product.stock_quantity || 100) * product.price_per_unit
            }));
            
            downloadCSV(csvData, 'products-export.csv');
            showAlert('Products exported successfully!', 'success');
        })
        .catch(error => {
            showAlert(`Export failed: ${error.message}`, 'error');
        });
}

// Helper functions
function getStockStatus(stock) {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    if (stock < 50) return 'Medium Stock';
    return 'In Stock';
}

function getStatusClass(stock) {
    if (stock === 0) return 'danger';
    if (stock < 10) return 'warning';
    if (stock < 50) return 'info';
    return 'success';
}

// Load product for editing
async function loadProductForEdit(productId) {
    try {
        const product = await apiRequest(`/api/products/${productId}`);
        document.getElementById('productId').value = product.product_id;
        document.getElementById('productName').value = product.name;
        document.getElementById('uomId').value = product.uom_id;
        document.getElementById('pricePerUnit').value = product.price_per_unit;
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Load UOM options
async function loadUomOptions() {
    try {
        const uomList = await apiRequest('/api/uom');
        const selectElement = document.getElementById('uomId');
        
        // Clear existing options
        selectElement.innerHTML = '<option value="">Select Unit of Measure</option>';
        
        uomList.forEach(uom => {
            const option = document.createElement('option');
            option.value = uom.uom_id;
            option.textContent = uom.uom_name;
            selectElement.appendChild(option);
        });
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Initialize product form
function initProductForm(isEdit = false, productId = null) {
    loadUomOptions();
    
    if (isEdit && productId) {
        loadProductForEdit(productId);
    }
    
    const form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', (event) => {
            const url = isEdit ? `/api/products/${productId}` : '/api/products';
            const method = isEdit ? 'PUT' : 'POST';
            handleFormSubmit(event, url, method, '/products');
        });
    }
}

// Show modal when product cannot be deleted due to existing orders
function showProductCannotDeleteModal(productName, details) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-warning text-dark">
                    <h5 class="modal-title">
                        <i class="fas fa-exclamation-triangle me-2"></i>Cannot Delete Product
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-warning">
                        <h6><strong>${productName}</strong> cannot be deleted</h6>
                        <p class="mb-0">${details}</p>
                    </div>
                    <div class="mt-3">
                        <h6>Alternative Options:</h6>
                        <ul class="list-unstyled">
                            <li class="mb-2">
                                <i class="fas fa-edit text-primary me-2"></i>
                                <strong>Edit Product:</strong> Update the product information instead
                            </li>
                            <li class="mb-2">
                                <i class="fas fa-eye-slash text-secondary me-2"></i>
                                <strong>Hide from Sales:</strong> Set stock to 0 to prevent new orders
                            </li>
                            <li>
                                <i class="fas fa-info-circle text-info me-2"></i>
                                <strong>Keep for Records:</strong> Products in orders must be preserved for accounting
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>Close
                    </button>
                    <a href="/products/edit/${getProductIdFromName(productName)}" class="btn btn-primary">
                        <i class="fas fa-edit me-1"></i>Edit Product Instead
                    </a>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Clean up modal after hiding
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// Helper function to get product ID from name (simplified approach)
function getProductIdFromName(productName) {
    // Try to find the product ID from the current table
    const rows = document.querySelectorAll('tr[data-product-id]');
    for (const row of rows) {
        const nameCell = row.querySelector('td:nth-child(2) strong');
        if (nameCell && nameCell.textContent === productName) {
            return row.getAttribute('data-product-id');
        }
    }
    return ''; // Return empty if not found
}

// Initialize products page
function initProductsPage() {
    loadProducts();
}

// CSV download helper
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