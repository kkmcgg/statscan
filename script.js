const projection = ol.proj.get('EPSG:4326');
/* const projection = ol.proj.get('EPSG:3347'); */

// Initialize the map
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM(),
            projection: projection // Set the projection for OSM
        }),
        /* new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: 'https://geo.statcan.gc.ca/geo_wa/services/2021/Cartographic_boundary_files/MapServer/WMSServer',
                params: {
                    'LAYERS': 'DA_-_lda_000b21s_e2811', // The specific layer for dissemination areas
                    'TILED': true,
                    'TRANSPARENT': true,
                    'FORMAT': 'image/png',
                    'CRS': 'EPSG:4326' // Ensure CRS matches the OSM base layer
                },
                projection: projection,
                serverType: 'geoserver'
            })
        }) */
        new ol.layer.Tile({
            source: new ol.source.TileArcGISRest({
                url: 'https://geo.statcan.gc.ca/geo_wa/rest/services/2021/Cartographic_boundary_files/MapServer',
                params: {
                    'LAYERS': '12' // The specific layer for dissemination areas
                },
                tileLoadFunction: function(imageTile, src) {
                    imageTile.getImage().src = src;
                },
                transition: 0 // Disable transition for faster loading
            }),
            opacity: 0.6
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-63.5752, 44.6488]), // Adjust the center 
        zoom: 10
    })
});

const vectorSource = new ol.source.Vector();

const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: '#319FD3',
            width: 1
        })
    })
});

map.addLayer(vectorLayer);

// Update the year label and fetch data for the selected year
function updateYear(year) {
    document.getElementById('yearLabel').innerText = year;
    fetchData(year);
}

// Fetch data from StatsCan API
async function fetchData(year) {
    const base_url = "https://www150.statcan.gc.ca/t1/wds/sdmx/statcan/v1/rest/vector";
    const vector_id = "v1288005873"; // Adjust vector ID
    const start_period = `${year}-01`;
    const end_period = `${year}-12`;
    const url = `${base_url}/${vector_id}?startPeriod=${start_period}&endPeriod=${end_period}`;

    console.log("Fetching data from URL:", url);

    try {
        const response = await fetch(url);
        console.log("Response status:", response.status);
        const text = await response.text();
        console.log("Data received:", text);

        // Parse the XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");

        // Extract data
        const series = xmlDoc.getElementsByTagName("generic:Series")[0];
        const observations = series.getElementsByTagName("generic:Obs");

        const geojson = convertToGeoJSON(observations);

        vectorSource.clear();
        vectorSource.addFeatures(new ol.format.GeoJSON().readFeatures(geojson));
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Convert the data to GeoJSON format
function convertToGeoJSON(observations) {
    // Dummy coordinates for demonstration
    const coordinates = [
        [
            [-63.5752, 44.6488],
            [-63.5752, 44.6588],
            [-63.5652, 44.6588],
            [-63.5652, 44.6488],
            [-63.5752, 44.6488]
        ]
    ];

    const features = Array.from(observations).map(obs => {
        const year = obs.getElementsByTagName("generic:ObsDimension")[0].getAttribute("value");
        const residents_over_55 = obs.getElementsByTagName("generic:ObsValue")[0].getAttribute("value");

        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: coordinates // Use actual coordinates for each feature
            },
            properties: {
                year: year,
                residents_over_55: parseFloat(residents_over_55)
            }
        };
    });

    return {
        type: 'FeatureCollection',
        features: features
    };
}


// Fetch GeoJSON data from GitHub
async function addGeoJSONLayer() {
    const url = 'https://raw.githubusercontent.com/kkmcgg/statscan/main/data/NSCD.geojson';

    try {
        const response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit'
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const geojsonData = await response.json();

        const geojsonSource = new ol.source.Vector({
            features: new ol.format.GeoJSON().readFeatures(geojsonData, {
                featureProjection: 'EPSG:3857' // Ensure the projection matches your map projection
            })
        });

        const geojsonLayer = new ol.layer.Vector({
            source: geojsonSource,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 0, 0.1)' // Customize the fill color
                }),
                stroke: new ol.style.Stroke({
                    color: '#000000',
                    width: 1
                })
            })
        });

        map.addLayer(geojsonLayer);

        // Add click event listener
        map.on('singleclick', function(evt) {
            const features = map.getFeaturesAtPixel(evt.pixel);
            if (features.length > 0) {
                const feature = features[0];
                const properties = feature.getProperties();
                console.log('Feature properties:', properties);
                alert(JSON.stringify(properties, null, 2));
            }
        });

    } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
    }
}

// Add the GeoJSON layer
addGeoJSONLayer();


// Initial fetch for the default year
fetchData(2020);


