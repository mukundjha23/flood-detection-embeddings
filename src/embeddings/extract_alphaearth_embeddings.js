// ======================================================
// AlphaEarth Embedding Extraction using Google Earth Engine
// ======================================================

// Load uploaded flood coordinate dataset
var table = ee.FeatureCollection(
    "YOUR_GEE_ASSET_PATH"
  );
  
  // ------------------------------------------------------
  // Convert latitude-longitude rows into point geometries
  // ------------------------------------------------------
  
  var points = table.map(function(feature) {
    
    var lon = ee.Number(feature.get('lon'));
    var lat = ee.Number(feature.get('lat'));
  
    return ee.Feature(
      ee.Geometry.Point([lon, lat]),
      feature.toDictionary()
    );
  });
  
  // ------------------------------------------------------
  // Visualize points on map
  // ------------------------------------------------------
  
  Map.addLayer(points, {}, "Flood Points");
  Map.centerObject(points);
  
  // ------------------------------------------------------
  // Load AlphaEarth / Satellite Embedding dataset
  // ------------------------------------------------------
  
  var dataset = ee.ImageCollection(
    'GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL'
  );
  
  // ------------------------------------------------------
  // Select embedding year
  // ------------------------------------------------------
  
  var image = dataset
    .filterDate('2017-01-01', '2018-01-01') // Refer Paper for Year
    .filterBounds(points)
    .first();
  
  // ------------------------------------------------------
  // Clip embeddings to study region
  // ------------------------------------------------------
  
  var clipped = image.clip(points.geometry());
  
  // ------------------------------------------------------
  // Extract embedding vectors
  // ------------------------------------------------------
  
  var extracted = clipped.sampleRegions({
    
    collection: points,
    scale: 10,
    geometries: true,
    tileScale: 8
  });
  
  // ------------------------------------------------------
  // Add latitude and longitude columns
  // ------------------------------------------------------
  
  var withCoords = extracted.map(function(feature) {
  
    var coords = feature.geometry().coordinates();
  
    return feature
      .set('longitude', coords.get(0))
      .set('latitude', coords.get(1))
      .setGeometry(null);
  });
  
  // ------------------------------------------------------
  // Export embeddings as CSV
  // ------------------------------------------------------
  
  Export.table.toDrive({
  
    collection: withCoords,
  
    description: 'alphaearth_embeddings_export',
  
    fileFormat: 'CSV'
  });
  
  // ======================================================
  // End of Script
  // ======================================================