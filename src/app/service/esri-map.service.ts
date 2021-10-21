import {
  ElementRef, Injectable,
  Renderer2,
  RendererFactory2
} from '@angular/core';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import {MapList} from '../stores/models/map.model';
import {AddMapAction} from '../stores/actions/map.actions';
import {Store} from '@ngrx/store';
import {AppState} from '../stores/models/app-model.state';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class EsriMapService {

  // NOTE: Map ID is how we identify the object in the store
  private mapId: string;

  // NOTE: Map / View
  private webMap: WebMap;
  private mapView: MapView;

  // NOTE: This allows us to attach / remove the mapViewContainer DIV from the ElementRef
  private renderer: Renderer2;

  // NOTE: This stores the list of divs allocated for the map
  private mapViewContainer: HTMLDivElement[] = [];

  // NOTE: This denotes what map div to grab, from the above array
  // NOTE: -1 means we have no map div allocated for ourselves
  private mapContainerIdx = -1;

  // NOTE: This should place us in Creston
  private center: Array<number> = [-116.51212386503, 49.1030138147457];

  constructor(private rendererFactory: RendererFactory2,
              private store: Store<AppState>) {}

  public setMapID(mapID: string): void {
    this.mapId = mapID;
  }

  public initializeMapView(elementRef: ElementRef, Map: MapList): Promise<{map: WebMap, view: MapView}> {
    return new Promise((r) => {
      // NOTE: Allocate a new map object
      if (Map === undefined) {
        Map = {
          id: this.mapId,
          container: -1,
          map: new WebMap({
            basemap: 'topo'
          }),
          view: undefined
        };
      }

      this.createMapViewContainer(elementRef, Map);
      this.createWebMap(Map);
      this.createMapView(Map);

      r({map: this.webMap, view: this.mapView});
    });
  }

  private createMapViewContainer(elementRef: ElementRef, Map: MapList): void {
    if (elementRef == null) {
      return;
    }

    if (Map.container === -1) {
      this.mapViewContainer.push(document.createElement('div'));

      this.mapContainerIdx = this.mapViewContainer.length - 1;
      this.mapViewContainer[this.mapContainerIdx].style.cssText = 'height: 100%';
      Map.container = _.cloneDeep(this.mapContainerIdx);
    } else {
      this.mapContainerIdx = Map.container;
    }

    this.initializeRenderer();
    this.renderer.appendChild(elementRef.nativeElement, this.mapViewContainer[this.mapContainerIdx]);
  }

  private createWebMap(Map: MapList): void {
    this.webMap = Map.map;
  }

  private createMapView(Map: MapList): void {
    if (Map.view === undefined) {
      this.mapView = new MapView({
        container: this.mapViewContainer[this.mapContainerIdx],
        center: this.center,
        map: this.webMap,
        zoom: 13
      });

      Map.view = this.mapView;

      // NOTE: We've allocated the entire map, now add it
      this.store.dispatch(new AddMapAction(Map));
    } else {
      this.mapView = Map.view;
    }
  }

  private initializeRenderer(): void {
    if (this.renderer == null) {
      this.renderer = this.rendererFactory.createRenderer(null, null);
    }
  }

  public removeMapViewContainer(elementRef: ElementRef): void {
    if (this.mapViewContainer == null) {
      return;
    }

    this.initializeRenderer();
    this.renderer.removeChild(elementRef.nativeElement, this.mapViewContainer[this.mapContainerIdx]);
  }
}
