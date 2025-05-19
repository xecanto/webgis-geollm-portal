# WebGIS GeolLM Portal Feature Testing Guide

This guide will help you test the new features added to the WebGIS GeolLM Portal's right sidebar.

## 1. SQL Query Functionality

1. Navigate to the application and click on the "Query" tab in the right sidebar.
2. You should see a SQL editor with syntax highlighting.
3. Try running a simple query: `SELECT * FROM admin1 LIMIT 5`
4. Verify that the results appear in a table format below the query editor.
5. Attempt to run an unsafe query like `DELETE FROM admin1` and verify that it's blocked.

## 2. Measurement Tools

1. Click on the "Tools" tab in the right sidebar.
2. Under "Drawing Tools", click on "Measure Distance".
3. Click on the map to create a line, adding multiple points.
4. Double-click to finish the line and observe the measurement results.
5. Try the same with "Measure Area" by drawing a polygon.
6. Verify that measurements are shown in multiple units (meters/kilometers for distance, square meters/hectares/square kilometers for area).

## 3. Export and Share Capabilities

1. In the "Tools" tab, locate the "Export & Share" section.
2. Try exporting the current map view in PNG format by clicking "Export Image".
3. Try exporting as PDF by clicking "Export PDF".
4. Test the "Generate Shareable Link" button and verify that it copies a URL to your clipboard.
5. Paste the URL in a new browser tab and verify that it opens the same map view.

## 4. Coordinate Input Navigation

1. In the "Tools" tab, find the "Coordinate Input" section.
2. Enter coordinates in the format: 
   - Longitude: 69.3451
   - Latitude: 30.3753
3. Click "Go to Location" and verify that the map navigates to that position.
4. Verify that a temporary marker appears at the specified location.

## Known Issues and Limitations

- The marker from coordinate navigation disappears after 5 seconds by design.
- Very large SQL query results might be truncated to improve performance.
- Map export in SVG format may have some rendering differences compared to PNG.

## Troubleshooting

If any features are not working as expected:

1. Check browser console for errors (F12 > Console).
2. Verify that the backend server is running.
3. Ensure all dependencies are properly installed.
4. Try refreshing the page or restarting the application.
