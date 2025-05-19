import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database connection parameters
DB_PARAMS = {
    "dbname": os.getenv("DB_NAME", "pakistan_sdi"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "12340"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432")
}

# GeoServer connection parameters
GEOSERVER_URL = os.getenv("GEOSERVER_URL", "http://localhost:8070/geoserver")
GEOSERVER_WORKSPACE = os.getenv("GEOSERVER_WORKSPACE", "pakistan")
GEOSERVER_USER = os.getenv("GEOSERVER_USER", "admin")
GEOSERVER_PASSWORD = os.getenv("GEOSERVER_PASSWORD", "geoserver")

# Allowed tables for queries (for security)
ALLOWED_TABLES = [
    'admin0', 'admin1', 'admin2', 'admin3', 'buildings', 
    'landuse', 'roads', 'railways', 'waterways'
]

# Valid spatial operations
VALID_SPATIAL_OPERATIONS = ['intersects', 'contains', 'within', 'dwithin']