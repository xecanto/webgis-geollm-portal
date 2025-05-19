from flask import Blueprint, request
import requests
from config.config import GEOSERVER_URL, GEOSERVER_USER, GEOSERVER_PASSWORD

geoserver_bp = Blueprint('geoserver', __name__, url_prefix='/api')

@geoserver_bp.route('/geoserver_proxy/<path:path>', methods=['GET'])
def geoserver_proxy(path):
    """Proxy requests to GeoServer to avoid CORS issues"""
    try:
        # Forward the request to GeoServer
        url = f"{GEOSERVER_URL}/{path}"
        
        # Copy original request params
        params = request.args.to_dict()
        
        # Make request to GeoServer
        response = requests.get(url, params=params, auth=(GEOSERVER_USER, GEOSERVER_PASSWORD))
        
        # Return the GeoServer response
        return response.content, response.status_code, {'Content-Type': response.headers.get('Content-Type')}
    
    except Exception as e:
        return {"error": str(e)}, 500