import psycopg2
import psycopg2.extras
import json
from config.config import DB_PARAMS

def get_db_connection():
    """Create and return a database connection"""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        conn.autocommit = True
        return conn
    except psycopg2.OperationalError as e:
        print(f"Database connection error: {str(e)}")
        # Re-raise with a more informative message
        raise psycopg2.OperationalError(f"Failed to connect to database. Please check database settings: {str(e)}")
    except Exception as e:
        print(f"Unexpected error connecting to database: {str(e)}")
        raise

def postgis_to_geojson(query, params=None):
    """Convert PostGIS results to GeoJSON format"""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    if params:
        cursor.execute(query, params)
    else:
        cursor.execute(query)
    
    features = []
    for row in cursor:
        properties = {key: value for key, value in row.items() if key != 'geom'}
        
        # Handle geometry column
        geometry = None
        if 'geom' in row and row['geom']:
            # Convert WKB hex to GeoJSON geometry
            cursor.execute("SELECT ST_AsGeoJSON(%s::geometry) AS geojson", (row['geom'],))
            geometry = json.loads(cursor.fetchone()['geojson'])
        
        feature = {
            "type": "Feature",
            "properties": properties,
            "geometry": geometry
        }
        features.append(feature)
    
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    cursor.close()
    conn.close()
    
    return geojson