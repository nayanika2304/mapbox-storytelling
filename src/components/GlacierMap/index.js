import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { config } from '../GlacierMap/config';
import './Map.css';
import {transformRequest} from '../constants/transformRequest'
import {alignments,layerTypes} from '../constants/attributes'

mapboxgl.accessToken = config.accessToken;

const scroller = window.scrollama();
let initLoad = true;
window.addEventListener('resize', scroller.resize);


const GlacierMap = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    
    const getLayerPaintType = (layer) => {
        var layerType = map.getLayer(layer).type;
        return layerTypes[layerType];
    }

    const setLayerOpacity = (layer) => {
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

    useEffect(() =>{
        if (map.current) return;
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: config.style,
            center: config.chapters[0].location.center,
            zoom: config.chapters[0].location.zoom,
            bearing: config.chapters[0].location.bearing,
            pitch: config.chapters[0].location.pitch,
            interactive: false,
            transformRequest: transformRequest
        })
        //return () => map.current.remove();

    },[]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {

        if (config.showMarkers) {
            var marker = new mapboxgl.Marker({ color: config.markerColor });
            marker.setLngLat(config.chapters[0].location.center).addTo(map.current);
        }

        map.current.on("load",function(){
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
                map.current.addLayer({
                    'id': 'sky',
                    'type': 'sky',
                    'paint': {
                        'sky-type': 'atmosphere',
                        'sky-atmosphere-sun': [0.0, 0.0],
                        'sky-atmosphere-sun-intensity': 15
                    }
                });
            };
        })
        // setup the instance, pass callback functions
        scroller
        .setup({
            step: '.step',
            offset: 0.5,
            progress: true
        }).onStepEnter(response => {
            var chapter = config.chapters.find(chap => chap.id === response.element.id);
            response.element.classList.add('active');
            map.current[chapter.mapAnimation || 'flyTo'](chapter.location);
    
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
                map.current.once('moveend', function() {
                    const rotateNumber = map.getBearing();
                    map.current.rotateTo(rotateNumber + 90, {
                        duration: 24000, easing: function (t) {
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
        });

    },[]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            <div id="map" ref={mapContainer} className="map-container"></div>
            <div id="story">
                <div id="header" className={config.title.length > 0 ? `${config.theme}` : ' '}>
                    <h1>{config.title}</h1>
                    <h2>{config.subtitle}</h2>
                    <p>{config.byline}</p>
                </div>
            </div>
        </div>
    )
}

export default GlacierMap