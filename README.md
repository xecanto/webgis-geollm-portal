# GeoLLM - Geospatial Large Language Model Interface

A full-stack geospatial web application for Pakistan that combines GIS capabilities with large language model interactions to enable natural language querying of spatial data.

## Project Overview

GeoLLM is an interactive geospatial platform focused on Pakistan's geographic data with the following features:

- Interactive map interface with multiple base layers and data overlays
- Administrative boundaries (country, provinces, districts, tehsils)
- OSM feature layers (roads, buildings, waterways, railways, land use)
- Spatial analysis tools
- Natural language querying of geospatial data using LLMs
- Custom visualization for Land Surface Temperature (LST) and Land Use Land Cover (LULC) data
- SQL-based query functionality with security protections
- Measurement tools for distance and area calculation
- Export capabilities in multiple formats (PNG, SVG, PDF)
- Coordinate input navigation with marker visualization

## System Requirements

- Python 3.8+ (for backend)
- Node.js 16+ and Yarn (for frontend)
- PostgreSQL with PostGIS extension
- GeoServer 2.22+
- GDAL (optional, for advanced data processing)

## Project Structure

```
├── backend/           # Flask API backend
├── frontend/          # Preact/Vite frontend application
├── data/              # GIS data files (shapefiles)
├── geollm/            # GeoLLM Python module
└── transformers/      # Transformer models for LLM functionality
```

## Setup Instructions

### Setting up the Backend

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/geollm.git
   cd geollm
   ```

2. **Create and activate a Python virtual environment**:

   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install backend dependencies**:

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:

   Copy the `.env.example` file to `.env` (if not already present) and update the values:

   ```bash
   # Database configuration
   DB_NAME=pakistan_sdi
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_HOST=localhost
   DB_PORT=5432

   # GeoServer configuration
   GEOSERVER_URL=http://localhost:8070/geoserver
   GEOSERVER_WORKSPACE=pakistan
   GEOSERVER_USER=admin
   GEOSERVER_PASSWORD=geoserver

   # Flask configuration
   FLASK_APP=app.py
   FLASK_ENV=development
   FLASK_DEBUG=1
   FLASK_PORT=5000
   ```

5. **Set up PostgreSQL database**:

   - Install PostgreSQL and PostGIS
   - Create a database named `pakistan_sdi`
   - Enable PostGIS extension:
     ```sql
     CREATE EXTENSION postgis;
     ```
   - Import data using the provided SQL scripts (if available) or use shapefiles

6. **Set up GeoServer**:

   - Install GeoServer (version 2.22 or newer)
   - Create a workspace named `pakistan`
   - Add PostGIS data stores pointing to your PostgreSQL database
   - Publish layers for administrative boundaries and OSM features

7. **Run the backend server**:

   ```bash
   flask run --port=5000
   # Or use python directly:
   # python app.py
   ```
   
   The backend API should now be running at http://localhost:5000

### Setting up the Frontend

1. **Navigate to the frontend directory**:

   ```bash
   cd ../frontend
   ```

2. **Install dependencies using Yarn**:

   ```bash
   yarn install
   ```

3. **Configure environment variables**:

   Create a `.env` file in the frontend directory with the following variables:

   ```properties
   # API connection
   VITE_API_URL=http://localhost:5000/api
   VITE_API_TIMEOUT=30000

   # Map configuration
   VITE_GEOSERVER_URL=http://localhost:8070/geoserver
   VITE_GEOSERVER_WORKSPACE=pakistan
   VITE_DEFAULT_MAP_CENTER=69.3451,30.3753
   VITE_DEFAULT_MAP_ZOOM=5

   # Feature flags
   VITE_ENABLE_GEOLLM=true
   VITE_ENABLE_ANALYTICS=true

   # UI configuration 
   VITE_DEFAULT_BASEMAP=light
   VITE_DEFAULT_THEME=dark
   ```

4. **Start the development server**:

   ```bash
   yarn dev
   ```

   The frontend application should now be running at http://localhost:3000

### Running Both Services

For convenience, you can use the following commands to run both services:

**Windows**:
Create a file named `start_app.bat` in the project root:

```bat
@echo off
start cmd /k "cd backend && venv\Scripts\activate && python app.py"
start cmd /k "cd frontend && yarn dev"
```

**macOS/Linux**:
Create a file named `start_app.sh` in the project root:

```bash
#!/bin/bash
gnome-terminal -- bash -c "cd backend && source venv/bin/activate && python app.py; bash"
gnome-terminal -- bash -c "cd frontend && yarn dev; bash"
```

Make it executable:
```bash
chmod +x start_app.sh
```

## Data Sources

The application uses the following data sources for Pakistan:

- Administrative boundaries (GADM v4.1): `data/gadm41_PAK_shp/`
- OpenStreetMap data: `data/pakistan-latest-free.shp/`
- Land Surface Temperature data (not included, to be added)
- Land Use Land Cover classification (not included, to be added)

## Accessing the Application

Once both services are running:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- GeoServer: http://localhost:8070/geoserver

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check connection parameters in `.env` file
   - Ensure PostGIS extension is enabled

2. **GeoServer Connection Issues**:
   - Verify GeoServer is running
   - Check URL and workspace name in environment variables
   - Ensure layers are properly published

3. **Backend API Not Responding**:
   - Check if Flask server is running
   - Verify port 5000 is not in use by another application
   - Look for errors in terminal output

4. **Frontend Not Loading Properly**:
   - Check browser console for JavaScript errors
   - Verify API URL is correctly set in frontend `.env` file
   - Ensure all dependencies were properly installed with `yarn install`

## License

[Add your license information here]

## Contributors

[List project contributors here]