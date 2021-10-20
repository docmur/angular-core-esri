import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';

// NOTE: This will store a the WebMap, and MapView
// NOTE: for our application, we'll only allocate 1 map
// NOTE: per instance (Hopefully this cuts down on memory usage)

export interface MapList {
    id: string;
    container: number;
    map: WebMap;
    view: MapView;
}
