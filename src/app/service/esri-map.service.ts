import {
  ElementRef, Injectable,
  Renderer2,
  RendererFactory2
} from '@angular/core';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import {MapList} from '../stores/models/map.model';
import {UpdateMapAction} from '../stores/actions/map.actions';
import {Store} from '@ngrx/store';
import {AppState} from '../stores/models/app-model.state';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class EsriMapService {

  private mapId: string;
  private webMap: WebMap;
  private mapView: MapView;
  private renderer: Renderer2;
  private mapViewContainer: HTMLDivElement[] = [];
  private mapContainerIdx = -1;
  private center: Array<number> = [-116.51212386503, 49.1030138147457];

  constructor(private rendererFactory: RendererFactory2,
              private store: Store<AppState>) {
  }

  public setMapID(mapID: string): void {
    this.mapId = mapID;
  }

  public initializeMapView(elementRef: ElementRef, Map: MapList): Promise<MapView> {
    return new Promise((r) => {
      this.createMapViewContainer(elementRef, Map);
      this.createWebMap(Map);
      this.createMapView(Map);

      r(this.mapView);
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

      // NOTE: Backup the view
      this.store.dispatch(new UpdateMapAction(Map));
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
