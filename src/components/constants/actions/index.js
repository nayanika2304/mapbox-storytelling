import {layerTypes,alignments} from '../../constants/attributes'

let initLoad = true;
export const getLayerPaintType = (layer,map) =>  {
    let layerType = map.getLayer(layer).type;
    return layerTypes[layerType];
}

export const setLayerOpacity = (layer,map) => {
    let paintProps = getLayerPaintType(layer.layer);
    paintProps.forEach(function(prop) {
        let options = {};
        if (layer.duration) {
            var transitionProp = prop + "-transition";
            options = { "duration": layer.duration };
            map.setPaintProperty(layer.layer, transitionProp, options);
        }
        map.setPaintProperty(layer.layer, prop, layer.opacity, options);
    });
}

export const addInsetLayer = (bounds,mapInset) =>  {
    mapInset.addSource('boundsSource', {
        'type': 'geojson',
        'data': bounds
    });

    mapInset.addLayer({
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
    mapInset.addLayer({
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

export const  updateInsetLayer = (bounds,mapInset) => {
    mapInset.getSource('boundsSource').setData(bounds);
}

export const getInsetBounds = (map, mapInset) =>  {
    
    let bounds = map.getBounds();
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
        addInsetLayer(boundsJson,mapInset);
        initLoad = false;
    } else {
        updateInsetLayer(boundsJson,mapInset);
    }

}