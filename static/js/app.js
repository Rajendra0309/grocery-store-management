// Common utility functions

// Initialize Notyf for notifications
const notyf = new Notyf({
    duration: 4000,
    position: {
        x: 'right',
        y: 'top',
    },
    types: [
        {
            type: 'success',
            background: '#2d8f47',
            icon: {
                className: 'fas fa-check-circle',
                tagName: 'i'
            }
        },
        {
            type: 'error',
            background: '#e74c3c',
            icon: {
                className: 'fas fa-times-circle',
                tagName: 'i'
            }
        },
        {
            type: 'warning',
            background: '#f39c12',
            icon: {
                className: 'fas fa-exclamation-triangle',
                tagName: 'i'
            }
        },
        {
            type: 'info',
            background: '#3498db',
            icon: {
                className: 'fas fa-info-circle',
                tagName: 'i'
            }
        }
    ]
});

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount || 0);
}

// Show alert message using Notyf
function showAlert(message, type = 'success') {
    notyf.open({
        type: type,
        message: message
    });
}

// Enhanced confirmation dialog with SweetAlert-like styling
function confirmDelete(message, callback, options = {}) {
    const defaults = {
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#6c757d'
    };
    
    const config = { ...defaults, ...options };
    
    // Simple confirm dialog for now (can be enhanced with SweetAlert2 later)
    if (confirm(`${config.title}\n\n${message}`)) {
        callback();
    }
}

// Enhanced API request helper with better error handling
async function apiRequest(url, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        showLoadingSpinner(true);
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return result;
    } catch (error) {
        console.error('API Request Error:', error);
        showAlert(`API Error: ${error.message}`, 'error');
        throw error;
    } finally {
        showLoadingSpinner(false);
    }
}

// Show/hide loading spinner
function showLoadingSpinner(show) {
    let spinner = document.getElementById('globalSpinner');
    
    if (show && !spinner) {
        spinner = document.createElement('div');
        spinner.id = 'globalSpinner';
        spinner.className = 'global-spinner';
        spinner.innerHTML = `
            <div class="spinner-overlay">
                <div class="spinner-content">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="mt-2 text-muted">Processing...</div>
                </div>
            </div>
        `;
        document.body.appendChild(spinner);
    }
    
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

// Enhanced load data function with retry mechanism
async function loadData(url, targetElement, templateFunction, retries = 3) {
    const element = document.getElementById(targetElement);
    if (!element) {
        console.error(`Element with ID '${targetElement}' not found`);
        return;
    }
    
    // Show loading state
    element.classList.add('loading');
    element.innerHTML = `
        <div class="text-center p-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-2 text-muted">Loading data...</div>
        </div>
    `;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const data = await apiRequest(url);
            element.innerHTML = templateFunction(data);
            element.classList.remove('loading');
            return data;
        } catch (error) {
            console.error(`Error loading data (attempt ${attempt}):`, error);
            
            if (attempt === retries) {
                element.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle"></i> 
                        <strong>Error loading data:</strong> ${error.message}
                        <br>
                        <button class="btn btn-sm btn-outline-danger mt-2" onclick="location.reload()">
                            <i class="fas fa-refresh"></i> Retry
                        </button>
                    </div>
                `;
                element.classList.remove('loading');
                return null;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

// Handle form submission
async function handleFormSubmit(event, url, method, redirectUrl) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.textContent : '';
    
    // Disable submit button and show loading state
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Processing...';
    }
    
    // Clear previous validation states
    const formControls = form.querySelectorAll('.form-control');
    formControls.forEach(control => {
        control.classList.remove('is-invalid', 'is-valid');
    });
    
    const formData = new FormData(form);
    const data = {};
    
    formData.forEach((value, key) => {
        // Convert numeric values
        if (!isNaN(value) && value !== '' && value !== null) {
            data[key] = Number(value);
        } else {
            data[key] = value;
        }
    });
    
    try {
        const result = await apiRequest(url, method, data);
        
        // Mark form as valid
        formControls.forEach(control => {
            if (control.value) {
                control.classList.add('is-valid');
            }
        });
        
        showAlert(result.message || 'Operation completed successfully', 'success');
        
        if (redirectUrl) {
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
        }
    } catch (error) {
        console.error('Form submission error:', error);
        
        // Mark form as invalid
        formControls.forEach(control => {
            if (control.value) {
                control.classList.add('is-invalid');
            }
        });
        
        showAlert(error.message, 'error');
    } finally {
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }
}

// Animate navigation items on page load
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 * (index + 1));
    });
    
    // Add active class to current nav item
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (href === '/' && currentPath === '/')) {
            link.classList.add('active');
            link.style.color = 'var(--primary-color)';
        }
    });
});

// Calculate order total
function calculateOrderTotal(items) {
    return items.reduce((total, item) => total + parseFloat(item.total_price), 0);
}

// Input validation
function validateForm(form) {
    const formControls = form.querySelectorAll('.form-control[required]');
    let isValid = true;
    
    formControls.forEach(control => {
        const value = control.value.trim();
        
        // Clear previous validation states
        control.classList.remove('is-invalid', 'is-valid');
        
        if (!value) {
            control.classList.add('is-invalid');
            isValid = false;
        } else {
            // Additional validation based on input type
            if (control.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    control.classList.add('is-invalid');
                    isValid = false;
                } else {
                    control.classList.add('is-valid');
                }
            } else if (control.type === 'tel' && value) {
                const phoneRegex = /^\d{10,15}$/;
                if (!phoneRegex.test(value.replace(/\D/g, ''))) {
                    control.classList.add('is-invalid');
                    isValid = false;
                } else {
                    control.classList.add('is-valid');
                }
            } else if (control.type === 'number' && value) {
                const num = parseFloat(value);
                if (isNaN(num) || num <= 0) {
                    control.classList.add('is-invalid');
                    isValid = false;
                } else {
                    control.classList.add('is-valid');
                }
            } else {
                control.classList.add('is-valid');
            }
        }
    });
    
    return isValid;
}

// Debounce function for search/input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}