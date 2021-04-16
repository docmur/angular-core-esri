import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  NgZone
} from '@angular/core';

import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Bookmarks from '@arcgis/core/widgets/Bookmarks';
import Expand from '@arcgis/core/widgets/Expand';
import esriConfig from '@arcgis/core/config.js';
import {EsriService} from '../service/esri.service';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import * as _ from 'lodash';

@Component({
  selector: 'app-esri',
  templateUrl: './esri.component.html',
  styleUrls: ['./esri.component.css'],
})
export class EsriComponent implements OnInit, OnDestroy {
  private view: any = null;
  private dummyData: any;
  private fields: any;
  private featureLayer: any;
  private sortedMapData: any;
  private map: any = null;
  private center: Array<number> = [-116.51212386503, 49.1030138147457];


  // The <div> where we will place the map
  @ViewChild('mapViewNode', { static: true }) private mapViewEl: ElementRef;

  title = 'ng-cli';

  constructor(private esri: EsriService,
              private zone: NgZone) { }

  initializeMap(): Promise<any> {
    const container = this.mapViewEl.nativeElement;

    const webmap = new WebMap({
      basemap: 'topo'
    });

    const view = new MapView({
      container,
      center: this.center,
      map: webmap,
      zoom: 13
    });

    const bookmarks = new Bookmarks({
      view,
      // allows bookmarks to be added, edited, or deleted
      editingEnabled: true,
    });

    const bkExpand = new Expand({
      view,
      content: bookmarks,
      expanded: true,
    });

    // Add the widget to the top-right corner of the view
    view.ui.add(bkExpand, 'top-right');

    // bonus - how many bookmarks in the webmap?
    webmap.when(() => {
      if (webmap.bookmarks && webmap.bookmarks.length) {
        console.log('Bookmarks: ', webmap.bookmarks.length);
      } else {
        console.log('No bookmarks in this webmap.');
      }
    });

    this.view = view;
    this.map = webmap;
    return this.view.when();
  }

  fixMapData(): Promise<unknown> {
    return new Promise<void>((r) => {
      this.sortedMapData = this.dummyData.features.map((entries, index) => {
        const geometry = {
          type: 'polyline',
          paths: entries.geometry.coordinates
        };

        return {
          geometry: _.cloneDeep(geometry),
          attributes: {
            ObjectID: index,
            colour: '#9ee86b',
            geometry: 'polyline',
          }
        };
      });
      r();
    });
  }

  createFeatureLayers(): Promise<unknown> {
    return new Promise<void>( (r) => {
      this.featureLayer = new FeatureLayer(this.buildFeatureSettings('polyline', this.sortedMapData, '#4fb821'));
      r();
    });
  }

  buildFeatureSettings(geometryType, data, colour): any {
    return {
      source: data,
      renderer: this.buildRenderSettings(data, colour),
      fields: this.fields,
      objectIdField: 'ObjectID',
      geometryType,
      spatialReference: {
        wkid: 4326
      },
      title: 'test'
    };
  }

  buildRenderSettings(data, colour: string): any {
    return {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        size: 30,
        width: 3,
        color: _.cloneDeep(colour),
        outline: {
          width: 4,
          color: _.cloneDeep(colour),
        }
      }
    };
  }

  ngOnInit(): any {

    // Required: Set this property to insure assets resolve correctly.
    // IMPORTANT: the directory path may be different between your production app and your dev app
    esriConfig.assetsPath = './assets';

    this.zone.runOutsideAngular(() => {
      // Initialize MapView and return an instance of MapView
      this.initializeMap().then(() => {
        // The map has been initialized
        this.zone.run(() => {
          console.log('mapView ready: ');

          /* Grab some data */
          this.dummyData = this.esri.grabData();
          this.fixMapData().then( () => {
            this.createFeatureLayers().then(() => {
              this.map.add(this.featureLayer);
            });
          });

          console.log('Dummy Data');
        });
      });

    });
  }

  ngOnDestroy(): void {
    if (this.view) {
      // destroy the map view
      this.view.destroy();
    }

    try {
      console.log('Removing the Map Elem');
      this.mapViewEl.nativeElement.remove();
    } catch (error) {
      console.log(error);
    }
  }
}
