import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';
import {transformRequest} from '../constants/transformRequest'
import {config} from './config'
import {alignments,layerTypes} from '../constants/attributes'
mapboxgl.accessToken = config.accessToken;

const scroller = window.scrollama();
let initLoad = true;
window.addEventListener('resize', scroller.resize);

const StoryMap = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const insetMapContainer = useRef(null);
    const insetMap = useRef(null);
    const [lng, setLng] = useState(config.chapters[0].location.center[0]);
    const [lat, setLat] = useState(config.chapters[0].location.center[1]);
    const [zoom, setZoom] = useState(9);    

    //Helper functions for insetmap
    const getInsetBounds = () => {
    let bounds = map.current.getBounds();

    let boundsJson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            bounds._sw.lng,
                            bounds._sw.lat
                        ],
                        [
                            bounds._ne.lng,
                            bounds._sw.lat
                        ],
                        [
                            bounds._ne.lng,
                            bounds._ne.lat
                        ],
                        [
                            bounds._sw.lng,
                            bounds._ne.lat
                        ],
                        [
                            bounds._sw.lng,
                            bounds._sw.lat
                        ]
                    ]
                ]
            }
        }]
    }

    if (initLoad) {
        addInsetLayer(boundsJson);
        initLoad = false;
    } else {
        updateInsetLayer(boundsJson);
    }

    }

    const addInsetLayer = (bounds) => {
        insetMap.current.addSource('boundsSource', {
            'type': 'geojson',
            'data': bounds
        });
    
        insetMap.current.addLayer({
            'id': 'boundsLayer',
            'type': 'fill',
            'source': 'boundsSource', // reference the data source
            'layout': {},
            'paint': {
                'fill-color': '#fff', // blue color fill
                'fill-opacity': 0.2
            }
        });
        // // Add a black outline around the polygon.
        insetMap.current.addLayer({
            'id': 'outlineLayer',
            'type': 'line',
            'source': 'boundsSource',
            'layout': {},
            'paint': {
                'line-color': '#000',
                'line-width': 1
            }
        });
    }

    const updateInsetLayer = (bounds) => {
        insetMap.current.getSource('boundsSource').setData(bounds);
    }

    const  getLayerPaintType = (layer) => {
        var layerType = map.getLayer(layer).type;
        return layerTypes[layerType];
    }

    const setLayerOpacity = (layer)  => {
        var paintProps = getLayerPaintType(layer.layer);
        paintProps.forEach(function(prop) {
            var options = {};
            if (layer.duration) {
                var transitionProp = prop + "-transition";
                options = { "duration": layer.duration };
                map.setPaintProperty(layer.layer, transitionProp, options);
            }
            map.setPaintProperty(layer.layer, prop, layer.opacity, options);
        });
    }

    // Initialize map and mapInset when component mounts
    useEffect(() => {
        if (map.current) return;
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: config.style,
            center: [lng,lat],
            zoom: zoom,
            bearing: config.chapters[0].location.bearing,
            pitch: config.chapters[0].location.pitch,
            interactive: false,
            transformRequest: transformRequest,
            projection: config.projection
        });

        // Create a inset map if enabled in config.js
        if (config.inset) {
            insetMap.current = new mapboxgl.Map({
            container: insetMapContainer.current, // container id
            style: 'mapbox://styles/mapbox/dark-v10', //hosted style id
            center: config.chapters[0].location.center,
            // Hardcode above center value if you want insetMap to be static.
            zoom: 3, // starting zoom
            hash: false,
            interactive: false,
            attributionControl: false,
            //Future: Once official mapbox-gl-js has globe view enabled,
            //insetmap can be a globe with the following parameter.
            //projection: 'globe'
            });
        }
            

        // Add navigation control (the +/- zoom buttons)
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        //Clean up on unmount
        //return () => map.current.remove();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    useEffect(() => {
        if (!map.current) return; // wait for map to initialize
        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
        });
    });

    useEffect(() =>{
        if (config.showMarkers) {
            var marker = new mapboxgl.Marker({ color: config.markerColor });
            marker.setLngLat(config.chapters[0].location.center).addTo(map.current);
        }

        map.current.on("load", () =>{
            if (config.use3dTerrain) {
                if (!map.current.getSource('mapbox-dem')){
                    map.current.addSource('mapbox-dem', {
                        'type': 'raster-dem',
                        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                        'tileSize': 512,
                        'maxzoom': 14
                    });
                }
                
                // add the DEM source as a terrain layer with exaggerated height
                map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
        
                // add a sky layer that will show when the map is highly pitched
                if (!map.current.getLayer('sky')){
                    map.current.addLayer({
                        'id': 'sky',
                        'type': 'sky',
                        'paint': {
                            'sky-type': 'atmosphere',
                            'sky-atmosphere-sun': [0.0, 0.0],
                            'sky-atmosphere-sun-intensity': 15
                        }
                    });
                }
            };

            // As the map moves, grab and update bounds in inset map.
            if (config.inset) {
                map.current.on('move', getInsetBounds);
            }

            // setup the instance, pass callback functions
            scroller
            .setup({
                step: '.step',
                offset: 0.5,
                progress: true
            })
            .onStepEnter(async response => {
                var chapter = config.chapters.find(chap => chap.id === response.element.id);
                response.element.classList.add('active');
                map.current[chapter.mapAnimation || 'flyTo'](chapter.location);
                // Incase you do not want to have a dynamic inset map,
                // rather want to keep it a static view but still change the
                // bbox as main map move: comment out the below if section.
                if (config.inset) {
                  if (chapter.location.zoom < 5) {
                    insetMap.current.flyTo({center: chapter.location.center, zoom: 0});
                  }
                  else {
                    insetMap.current.flyTo({center: chapter.location.center, zoom: 3});
                  }
                }
                if (config.showMarkers) {
                    marker.setLngLat(chapter.location.center);
                }
                if (chapter.onChapterEnter.length > 0) {
                    chapter.onChapterEnter.forEach(setLayerOpacity);
                }
                if (chapter.callback) {
                    window[chapter.callback]();
                }
                if (chapter.rotateAnimation) {
                    map.current.once('moveend', () => {
                        const rotateNumber = map.getBearing();
                        map.current.rotateTo(rotateNumber + 180, {
                            duration: 30000, easing: function (t) {
                                return t;
                            }
                        });
                    });
                }
            })
            .onStepExit(response => {
                var chapter = config.chapters.find(chap => chap.id === response.element.id);
                response.element.classList.remove('active');
                if (chapter.onChapterExit.length > 0) {
                    chapter.onChapterExit.forEach(setLayerOpacity);
                }
            })
        })
    })

    // div id with record.id is a CONTAINER 
    return (
        <div>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            
            <div id="map" ref={mapContainer} className="map-container" />
            <div id="mapInset" ref={insetMapContainer}></div>
            <div id="story">
                <div id="header" className={config.title.length > 0 ? `${config.theme}` : 'footer'}>
                    <h1>{config.title}</h1>
                    <h2>{config.subtitle}</h2>
                    <p>{config.byline}</p>
                </div>
                <div id="features">
                    {config.chapters.map((record,idx) =>{
                        return (
                            <div id={`${record.id}`} className={`step ${idx === 0 ? `active`: " "} ${alignments[record.alignment] || 'centered'} ${record.hidden ? 'hidden' : " "} ${config.theme}`}> 
                            <div id='chapter'>
                                <h3>{record.title}</h3>
                                <img src={record.image} alt="description"/>
                                <p>{record.description}</p>
                            </div>
                        </div>
                        )
                    })}
                    
                </div>
                <div id="footer" className={config.footer.length > 0 ? `${config.theme}` : 'footer'}>
                    <p>{config.footer}</p>
                </div>

            </div>
            
        </div>
    );
};


export default StoryMap