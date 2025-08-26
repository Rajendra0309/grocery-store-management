# Production database configuration for Render deployment
import os
import urllib.parse

# Check if we have a DATABASE_URL (common in many cloud platforms)
database_url = os.getenv('DATABASE_URL')

if database_url:
    # Parse DATABASE_URL if available
    url = urllib.parse.urlparse(database_url)
    db_config = {
        'host': url.hostname,
        'user': url.username,
        'password': url.password,
        'database': url.path[1:],  # Remove leading slash
        'port': url.port or 3306,
        'charset': 'utf8mb4',
        'collation': 'utf8mb4_unicode_ci',
        'autocommit': True,
        'time_zone': '+00:00',
        'connect_timeout': 60,
        'sql_mode': ''
    }
else:
    # Use individual environment variables for database connection in production
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'grocery_store'),
        'port': int(os.getenv('DB_PORT', '3306')),
        'charset': 'utf8mb4',
        'collation': 'utf8mb4_unicode_ci',
        'autocommit': True,
        'time_zone': '+00:00',
        'connect_timeout': 60,
        'sql_mode': ''
    }

# Print config for debugging (remove password for security)
debug_config = db_config.copy()
debug_config['password'] = '***' if debug_config['password'] else 'None'
print(f"Database config: {debug_config}")
