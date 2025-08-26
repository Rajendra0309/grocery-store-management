// Customers page functionality

// Load customers with enhanced error handling
async function loadCustomers() {
    await loadData('/api/customers', 'customersContainer', renderCustomers);
}

// Enhanced render customers list with better styling
function renderCustomers(customers) {
    if (!customers || customers.length === 0) {
        return `
            <div class="empty-state text-center py-5">
                <i class="fas fa-users fa-4x text-muted mb-3"></i>
                <h4>No Customers Found</h4>
                <p class="text-muted">Start building your customer base by adding your first customer.</p>
                <a href="/customers/add" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add First Customer
                </a>
            </div>
        `;
    }
    
    let html = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h3><i class="fas fa-users me-2"></i>Customers (${customers.length})</h3>
                <p class="text-muted">Manage your customer database</p>
            </div>
            <div class="btn-group">
                <a href="/customers/add" class="btn btn-success">
                    <i class="fas fa-plus"></i> Add Customer
                </a>
                <button class="btn btn-info" onclick="exportCustomers()">
                    <i class="fas fa-download"></i> Export
                </button>
                <button class="btn btn-secondary" onclick="loadCustomers()">
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
                                <th><i class="fas fa-user"></i> Name</th>
                                <th><i class="fas fa-phone"></i> Phone</th>
                                <th><i class="fas fa-envelope"></i> Email</th>
                                <th><i class="fas fa-map-marker-alt"></i> Address</th>
                                <th><i class="fas fa-cogs"></i> Actions</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    customers.forEach(customer => {
        html += `
            <tr data-customer-id="${customer.customer_id}">
                <td><strong>#${customer.customer_id}</strong></td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="customer-icon me-2">
                            <i class="fas fa-user-circle text-primary"></i>
                        </div>
                        <div>
                            <strong>${customer.name}</strong>
                        </div>
                    </div>
                </td>
                <td>${customer.phone ? `<i class="fas fa-phone text-success me-1"></i>${customer.phone}` : '<span class="text-muted">-</span>'}</td>
                <td>${customer.email ? `<i class="fas fa-envelope text-info me-1"></i>${customer.email}` : '<span class="text-muted">-</span>'}</td>
                <td>${customer.address ? `<i class="fas fa-map-marker-alt text-warning me-1"></i>${customer.address}` : '<span class="text-muted">-</span>'}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <a href="/customers/edit/${customer.customer_id}" 
                           class="btn btn-outline-primary" 
                           title="Edit Customer">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button onclick="deleteCustomer(${customer.customer_id}, '${customer.name}')" 
                                class="btn btn-outline-danger" 
                                title="Delete Customer">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="viewCustomerDetails(${customer.customer_id})" 
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
                Total Customers: ${customers.length}
            </small>
        </div>
    `;
    
    return html;
}

// Enhanced delete customer with better confirmation
async function deleteCustomer(customerId, customerName) {
    const message = `This will permanently delete "${customerName}" from your customer database. This action cannot be undone.`;
    
    confirmDelete(message, async () => {
        try {
            showAlert('Deleting customer...', 'info');
            
            // Use fetch directly to avoid double error alerts
            const response = await fetch(`/api/customers/${customerId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                // Handle specific error cases
                if (result.error && (result.error.includes('referenced in existing orders') || result.error.includes('has existing orders'))) {
                    showAlert(`Cannot delete "${customerName}" - they have existing orders. Customer records must be preserved for accounting purposes.`, 'warning');
                    return;
                } else {
                    showAlert(`Failed to delete "${customerName}": ${result.error || 'Unknown error'}`, 'error');
                    return;
                }
            }
            
            // Success - animate row removal
            const row = document.querySelector(`tr[data-customer-id="${customerId}"]`);
            if (row) {
                row.style.transition = 'all 0.3s ease';
                row.style.backgroundColor = '#ffebee';
                row.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    row.remove();
                }, 300);
            }
            
            showAlert(`Customer "${customerName}" deleted successfully!`, 'success');
            
            // Reload customers to update counts
            setTimeout(() => loadCustomers(), 1000);
            
        } catch (error) {
            console.error('Delete error:', error);
            showAlert(`Failed to delete "${customerName}": ${error.message}`, 'error');
        }
    }, {
        title: 'Delete Customer?',
        confirmButtonText: 'Yes, Delete Customer',
        icon: 'error'
    });
}

// View customer details in modal
async function viewCustomerDetails(customerId) {
    try {
        const customer = await apiRequest(`/api/customers/${customerId}`);
        
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user-circle me-2"></i>Customer Details
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2 text-muted">Contact Information</h6>
                                        <p><strong>ID:</strong> #${customer.customer_id}</p>
                                        <p><strong>Name:</strong> ${customer.name}</p>
                                        <p><strong>Phone:</strong> ${customer.phone || 'Not provided'}</p>
                                        <p><strong>Email:</strong> ${customer.email || 'Not provided'}</p>
                                        <p><strong>Address:</strong> ${customer.address || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-body">
                                        <h6 class="card-subtitle mb-2 text-muted">Actions</h6>
                                        <div class="d-grid gap-2">
                                            <a href="/customers/edit/${customer.customer_id}" class="btn btn-primary btn-sm">
                                                <i class="fas fa-edit"></i> Edit Customer
                                            </a>
                                            <a href="/orders/create?customer=${customer.customer_id}" class="btn btn-success btn-sm">
                                                <i class="fas fa-plus"></i> Create Order
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
        showAlert(`Failed to load customer details: ${error.message}`, 'error');
    }
}

// Export customers to CSV
function exportCustomers() {
    apiRequest('/api/customers')
        .then(customers => {
            const csvData = customers.map(customer => ({
                'Customer ID': customer.customer_id,
                'Name': customer.name,
                'Phone': customer.phone || '',
                'Email': customer.email || '',
                'Address': customer.address || ''
            }));
            
            downloadCSV(csvData, 'customers-export.csv');
            showAlert('Customers exported successfully!', 'success');
        })
        .catch(error => {
            showAlert(`Export failed: ${error.message}`, 'error');
        });
}

// Load customer for editing with better error handling
async function loadCustomerForEdit(customerId) {
    try {
        showAlert('Loading customer data...', 'info');
        const customer = await apiRequest(`/api/customers/${customerId}`);
        document.getElementById('customerId').value = customer.customer_id;
        document.getElementById('customerName').value = customer.name;
        document.getElementById('phone').value = customer.phone || '';
        document.getElementById('email').value = customer.email || '';
        document.getElementById('address').value = customer.address || '';
        showAlert('Customer data loaded successfully!', 'success');
    } catch (error) {
        showAlert(`Failed to load customer: ${error.message}`, 'error');
    }
}

// Initialize customer form with enhanced validation
function initCustomerForm(isEdit = false, customerId = null) {
    if (isEdit && customerId) {
        loadCustomerForEdit(customerId);
    }
    
    const form = document.getElementById('customerForm');
    if (form) {
        form.addEventListener('submit', (event) => {
            const url = isEdit ? `/api/customers/${customerId}` : '/api/customers';
            const method = isEdit ? 'PUT' : 'POST';
            handleFormSubmit(event, url, method, '/customers');
        });
        
        // Add real-time validation
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');
        
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                const phone = e.target.value.replace(/\D/g, '');
                e.target.value = phone;
                
                if (phone.length > 0 && (phone.length < 10 || phone.length > 15)) {
                    e.target.classList.add('is-invalid');
                } else {
                    e.target.classList.remove('is-invalid');
                    if (phone.length >= 10) {
                        e.target.classList.add('is-valid');
                    }
                }
            });
        }
        
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                const email = e.target.value;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (email.length > 0) {
                    if (emailRegex.test(email)) {
                        e.target.classList.remove('is-invalid');
                        e.target.classList.add('is-valid');
                    } else {
                        e.target.classList.add('is-invalid');
                        e.target.classList.remove('is-valid');
                    }
                } else {
                    e.target.classList.remove('is-invalid', 'is-valid');
                }
            });
        }
    }
}

// Initialize customers page
function initCustomersPage() {
    loadCustomers();
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