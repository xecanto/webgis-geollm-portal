# WebGIS GeolLM Portal - New Features Documentation

This document provides an overview of the newly implemented features in the WebGIS GeolLM Portal.

## 1. SQL-based Query Tool

Similar to Turbo Overpass in OSM, the SQL query tool allows users to perform powerful spatial queries on the database.

### Key Features
- **SQL Editor with Syntax Highlighting**: Write SQL queries with proper highlighting for improved readability.
- **Security Restrictions**: Strict prevention of destructive SQL operations through both frontend and backend validation.
- **Results Visualization**: Query results are displayed in an organized table format.
- **Query History**: Previous queries are saved for quick reuse.

### Implementation Details
- Frontend component: `SqlQueryPanel.jsx`
- Backend endpoint: `/api/query` in `query.py`
- Security measures: Regular expression validation to block unsafe operations

### Usage Example
```sql
SELECT * FROM roads WHERE type = 'primary' LIMIT 10
```

## 2. Measurement Tools

Tools for calculating distances and areas on the map.

### Key Features
- **Distance Measurement**: Calculate the distance between multiple points along a path.
- **Area Measurement**: Calculate the area enclosed by a polygon.
- **Multiple Units**: Results displayed in different units (meters/km for distance, sq. meters/hectares/sq. km for area).
- **Interactive Drawing**: Uses OpenLayers to allow interactive drawing on the map.

### Implementation Details
- Frontend component: `MeasurementTools.jsx`
- Backend endpoints: `/api/measure/distance` and `/api/measure/area` in `spatial.py`
- Uses PostGIS for accurate geospatial calculations

## 3. Export and Sharing Capabilities

Tools for exporting map visualizations and sharing the current map view.

### Key Features
- **Multiple Export Formats**: Export the current map view as PNG, SVG, or PDF.
- **High-Quality Output**: Preserves the visual fidelity of the map in exports.
- **Shareable Links**: Generate URLs that capture the current map state.
- **Preview Functionality**: Preview exports before downloading.

### Implementation Details
- Frontend component: `ExportTools.jsx`
- Utility class: `MapUtils.js` with export functionality
- Dependencies: file-saver, jspdf, canvg

## 4. Coordinate Input Navigation

Tool for navigating to specific coordinates on the map.

### Key Features
- **Coordinate Input**: Enter longitude and latitude values directly.
- **Input Validation**: Validates that coordinates are within proper ranges.
- **Marker Visualization**: Temporarily displays a marker at the specified location.
- **Smooth Animation**: Animates the map navigation for better user experience.

### Implementation Details
- Frontend component: `CoordinateInput.jsx`
- Uses OpenLayers API for map navigation and marker placement
- Includes support for different coordinate formats

## Testing The Features

Please refer to the `test-features.md` file for detailed instructions on how to test each of these new features.

## Future Improvements

- Enhanced SQL query templates for common operations
- Save and share measurement results
- Additional export formats and styling options
- Support for more coordinate input formats (DMS, UTM, etc.)
