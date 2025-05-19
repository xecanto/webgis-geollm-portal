from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Import Blueprints from routes
from routes.admin import admin_bp
from routes.spatial import spatial_bp
from routes.analytics import analytics_bp
from routes.query import query_bp
from routes.json_query import json_query_bp
from routes.ol import ol_bp
from services.geoserver import geoserver_bp

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(admin_bp)
    app.register_blueprint(spatial_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(query_bp)
    app.register_blueprint(json_query_bp)
    app.register_blueprint(ol_bp)
    app.register_blueprint(geoserver_bp)
    
    return app

# Create the Flask application
app = create_app()

# Main entry point
if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', '1') == '1'
    
    app.run(debug=debug, host='0.0.0.0', port=port)