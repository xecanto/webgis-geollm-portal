from flask import Blueprint, jsonify, request
from utils.database import get_db_connection, postgis_to_geojson
import json
from config.config import ALLOWED_TABLES, VALID_SPATIAL_OPERATIONS
import psycopg2
import psycopg2.extras

spatial_bp = Blueprint('spatial', __name__, url_prefix='/api')

@spatial_bp.route('/feature_info', methods=['GET'])
def get_feature_info():
    """Get info about a feature at a specific point"""
    try:
        lat = float(request.args.get('lat'))
        lng = float(request.args.get('lng'))
        layer = request.args.get('layer')
        
        # Validate layer name to prevent SQL injection
        if layer not in ALLOWED_TABLES:
            return jsonify({"error": "Invalid layer specified"}), 400
        
        # Create a point in WKT format
        point_wkt = f"POINT({lng} {lat})"
        
        # Query to find the feature that contains the point
        query = f"""
            SELECT * FROM {layer}
            WHERE ST_Contains(geom, ST_SetSRID(ST_GeomFromText(%s), 4326))
            LIMIT 1
        """
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cursor.execute(query, (point_wkt,))

        feature = cursor.fetchone()
        if not feature:
            return jsonify({"message": "No feature found at this location"}), 404
        
        # Convert row to dictionary, excluding geometry
        feature_dict = {key: value for key, value in feature.items() if key != 'geom'}
        
        cursor.close()
        conn.close()
        
        return jsonify(feature_dict)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@spatial_bp.route('/bbox_features', methods=['GET'])
def get_bbox_features():
    """Get features within a bounding box"""
    try:
        # Get parameters
        minx = float(request.args.get('minx'))
        miny = float(request.args.get('miny'))
        maxx = float(request.args.get('maxx'))
        maxy = float(request.args.get('maxy'))
        layer = request.args.get('layer')
        limit = int(request.args.get('limit', 1000))  # Default limit to 1000 features
        
        # Validate layer name to prevent SQL injection
        if layer not in ALLOWED_TABLES:
            return jsonify({"error": "Invalid layer specified"}), 400
        
        # Create a bounding box
        bbox_wkt = f"POLYGON(({minx} {miny}, {maxx} {miny}, {maxx} {maxy}, {minx} {maxy}, {minx} {miny}))"
        
        # Query to find features intersecting the bbox
        query = f"""
            SELECT *, 
                ST_AsGeoJSON(ST_Intersection(
                    geom, 
                    ST_SetSRID(ST_GeomFromText(%s), 4326)
                )) AS clipped_geom 
            FROM {layer}
            WHERE ST_Intersects(geom, ST_SetSRID(ST_GeomFromText(%s), 4326))
            LIMIT %s
        """
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cursor.execute(query, (bbox_wkt, bbox_wkt, limit))
        
        features = []
        for row in cursor:
            properties = {key: value for key, value in row.items() if key not in ['geom', 'clipped_geom']}
            
            # Use the clipped geometry
            geometry = json.loads(row['clipped_geom']) if row['clipped_geom'] else None
            
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
        
        return jsonify(geojson)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@spatial_bp.route('/spatial_query', methods=['POST'])
def spatial_query():
    """Execute spatial query with a user-defined geometry"""
    try:
        data = request.get_json()
        geometry = data.get('geometry')  # GeoJSON geometry
        layer = data.get('layer')
        operation = data.get('operation', 'intersects')  # Default to 'intersects'
        
        # Validate layer name
        if layer not in ALLOWED_TABLES:
            return jsonify({"error": "Invalid layer specified"}), 400
        
        # Validate operation
        if operation not in VALID_SPATIAL_OPERATIONS:
            return jsonify({"error": "Invalid spatial operation"}), 400
        
        # Convert GeoJSON to WKT
        geom_json = json.dumps(geometry)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get WKT from GeoJSON
        cursor.execute("SELECT ST_GeomFromGeoJSON(%s) as wkt", (geom_json,))
        wkt = cursor.fetchone()[0]
        
        # Build spatial query based on operation
        if operation == 'dwithin':
            distance = data.get('distance', 1000)  # Default to 1000 meters
            query = f"""
                SELECT *, ST_AsGeoJSON(geom) as geojson
                FROM {layer}
                WHERE ST_DWithin(
                    geom::geography, 
                    ST_SetSRID(ST_GeomFromText(%s), 4326)::geography, 
                    %s
                )
            """
            cursor.execute(query, (wkt, distance))
        else:
            # Map operation to PostGIS function
            spatial_func = f"ST_{operation.capitalize()}"
            query = f"""
                SELECT *, ST_AsGeoJSON(geom) as geojson
                FROM {layer}
                WHERE {spatial_func}(
                    geom, 
                    ST_SetSRID(ST_GeomFromText(%s), 4326)
                )
            """
            cursor.execute(query, (wkt,))
        
        # Process results
        columns = [desc[0] for desc in cursor.description]
        features = []
        
        for row in cursor.fetchall():
            properties = {}
            geometry = None
            
            for i, col in enumerate(columns):
                if col == 'geojson':
                    geometry = json.loads(row[i]) if row[i] else None
                elif col != 'geom':  # Skip the binary geom column
                    properties[col] = row[i]
            
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
        
        return jsonify(geojson)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
@spatial_bp.route('/measure/distance', methods=['POST'])
def measure_distance():
    """Calculate distance between two points or along a linestring"""
    try:
        data = request.get_json()
        
        # Can accept either a linestring or an array of points
        if 'linestring' in data:
            # GeoJSON LineString
            linestring = data['linestring']
            # Convert GeoJSON to WKT
            coordinates = linestring['coordinates']
            wkt = "LINESTRING(" + ",".join([f"{point[0]} {point[1]}" for point in coordinates]) + ")"
        elif 'points' in data:
            # Array of [lon, lat] points
            points = data['points']
            if len(points) < 2:
                return jsonify({"error": "At least 2 points are required for distance measurement"}), 400
                
            wkt = "LINESTRING(" + ",".join([f"{point[0]} {point[1]}" for point in points]) + ")"
        else:
            return jsonify({"error": "Either linestring or points must be provided"}), 400
            
        # Calculate distance in meters using PostGIS
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # ST_Length with geography type for geodesic distance in meters
        cursor.execute(
            "SELECT ST_Length(ST_Transform(ST_GeomFromText(%s, 4326), 3857)) AS distance_meters", 
            (wkt,)
        )
        
        result = cursor.fetchone()
        distance_meters = result[0]
        
        cursor.close()
        conn.close()
        
        # Format the response
        return jsonify({
            "distance_meters": float(distance_meters),
            "distance_km": float(distance_meters) / 1000,
            "units": "metric"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
@spatial_bp.route('/measure/area', methods=['POST'])
def measure_area():
    """Calculate area of a polygon"""
    try:
        data = request.get_json()
        
        # Can accept either a polygon GeoJSON or an array of coordinates
        if 'polygon' in data:
            # GeoJSON Polygon
            polygon = data['polygon']
            # Get coordinates
            coordinates = polygon['coordinates'][0]  # First ring (exterior)
            wkt = "POLYGON((" + ",".join([f"{point[0]} {point[1]}" for point in coordinates]) + "))"
        elif 'points' in data:
            # Array of [lon, lat] points for the exterior ring
            points = data['points']
            if len(points) < 3:
                return jsonify({"error": "At least 3 points are required for area measurement"}), 400
                
            # Ensure the polygon is closed
            if points[0] != points[-1]:
                points.append(points[0])
                
            wkt = "POLYGON((" + ",".join([f"{point[0]} {point[1]}" for point in points]) + "))"
        else:
            return jsonify({"error": "Either polygon or points must be provided"}), 400
            
        # Calculate area in square meters using PostGIS
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # ST_Area with geography type for geodesic area in square meters
        cursor.execute(
            "SELECT ST_Area(ST_Transform(ST_GeomFromText(%s, 4326), 3857)) AS area_meters_squared", 
            (wkt,)
        )
        
        result = cursor.fetchone()
        area_meters_squared = result[0]
        
        cursor.close()
        conn.close()
        
        # Format the response
        return jsonify({
            "area_square_meters": float(area_meters_squared),
            "area_square_km": float(area_meters_squared) / 1000000,
            "area_hectares": float(area_meters_squared) / 10000,
            "units": "metric"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500