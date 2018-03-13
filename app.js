mapboxgl.accessToken = 'pk.eyJ1IjoiZW5qYWxvdCIsImEiOiJjaWhtdmxhNTIwb25zdHBsejk0NGdhODJhIn0.2-F2hS_oTZenAWc0BMf_uw';

// Setup mapbox-gl map
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/outdoors-v9', // 'pencil-v4.json',
    center: [9.191383, 45.464211],
    zoom: 10
});

// Overlay svg layer that we can manipulate with d3
var container = map.getCanvasContainer();
var svg = d3.select(container).append('svg');

// Projection functions
var transform = d3.geoTransform({ point: projectPoint });
var path = d3.geoPath().projection(transform);

// Load map and datasets
map.on('load', function () {
    // draw points from csv
    d3.csv('dots.csv', function(err, data) {
        drawCSV(data);
    });
    // draw geojson shape
    d3.json('NILZone.geojson', function(err, data) {
        drawPolygons(data);
    });
});

// Project coordinates to the map's current state
function project(d) {
    return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
};

// Project any point (lon, lat) to map's current state
function projectPoint(lon, lat) { // degrees
    var point = map.project(new mapboxgl.LngLat(lon, lat));
    this.stream.point(point.x, point.y);
};

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<strong>NOME:</strong> <span style='color:red'>" + d.properties.NIL + "</span></br>" +
            "<strong>AREA (ettari):</strong> <span style='color:red'>" + d.properties.AreaHA + "</span></br>" +
            "<strong>FID_1:</strong> <span style='color:red'>" + d.properties.FID_1 + "</span></br>" +
            "<strong>FID_1_1:</strong> <span style='color:red'>" + d.properties.FID_1_1 + "</span></br>" +
            "<strong>ID:</strong> <span style='color:red'>" + d.properties.ID_NIL + "</span></br>";
    });

svg.call(tip);

// Draw circles with d3
var circles;
function drawCSV(data) {
    console.log("draw data");
    // Add circles
    circles = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 6);
    // Call the update function
    update();
};

// Draw polygons with d3
var polygons;
function drawPolygons(data) {
    // Add polygons
    polygons = svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr('fill-opacity', 0.4)
        .on('mouseover', mouseoverPolygon)
        .on('mouseout', mouseoutPolygon);
    
    // Call the update function
    update();
}

// Update d3 shapes' positions to the map's current state
function update() {
    circles.attr("cx", function(d) { return project([d.lon, d.lat]).x; })
        .attr("cy", function(d) { return project([d.lon, d.lat]).y; });
    polygons.attr("d", path);
};

function mouseoverPolygon(d) {
    // Highlight polygon
    d3.select(this).attr('fill-opacity', 0.7);
    tip.show(d);
};

function mouseoutPolygon(d){
    // Reset polygon color
    polygons.attr('fill-opacity', 0.4);
    tip.hide(d);
};

// re-render the visualization whenever the view changes
map.on("viewreset", update);
map.on("move", update);
map.on("moveend", update);

