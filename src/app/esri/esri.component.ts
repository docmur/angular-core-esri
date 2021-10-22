import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  RendererFactory2, Input, OnChanges, SimpleChanges
} from '@angular/core';

import {EsriService} from '../service/esri.service';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import * as _ from 'lodash';
import {Store} from '@ngrx/store';
import {AppState} from '../stores/models/app-model.state';
import {SelectMapByID} from '../stores/selectors/map.selectors';
import {filter, takeUntil} from 'rxjs/operators';
import {EsriMapService} from '../service/esri-map.service';
import {Subject} from 'rxjs';
import Query from '@arcgis/core/rest/support/Query';

@Component({
  selector: 'app-esri',
  templateUrl: './esri.component.html',
  styleUrls: ['./esri.component.css'],
})
export class EsriComponent implements OnInit, OnDestroy, OnChanges {
  private view: any = null;
  private dummyData: any;
  private fields: any;
  private featureLayer: any;
  private sortedMapData: any;
  private map: any = null;

  private ngUnsubscribe: Subject<any> = new Subject();

  @ViewChild('mapViewNode', { static: true }) private mapViewEl: ElementRef;

  @Input() mapId: string;

  title = 'ng-cli';

  constructor(private esri: EsriService,
              private mapService: EsriMapService,
              private rendererFactory: RendererFactory2,
              private store: Store<AppState>) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.mapId) {
      this.initializeMap();
    }
  }

  applyEditsToLayer(edits): Promise<number | Error> {
    return new Promise((r, j) => {
      this.featureLayer.applyEdits(edits).then((results) => {
        if (results.deleteFeatureResults.length > 0) {
          r(results.deleteFeatureResults);
        }

        if (results.addFeatureResults.length > 0){
          const objectIds = [];

          results.addFeatureResults.forEach((item) => {
            objectIds.push(item.objectId);
          });

          // query the newly added features from the layer
          this.featureLayer.queryFeatures( {objectIds} ).then((addedResults) => {
            r(addedResults.features.length);
          });
        }
      }).catch((error) => {
        console.error(error);
        j(error);
      });
    });
  }

  addFeatures(): Promise<number | Error> {
    return new Promise((r, j) => {
      // addEdits object tells applyEdits that you want to add the features
      const addEdits = {
        addFeatures: this.sortedMapData
      };

      // apply the edits to the layer
      this.applyEditsToLayer(addEdits).then((addedItems: number) => {
        r(addedItems);
      }).catch((error) => {
        j(error);
      });
    });
  }

  removeAllFeatureData(): Promise<number | Error> {
    return new Promise((r, j) => {
      if (this.featureLayer) {
        const query = new Query({
          outFields: ['*'],
          where: '1 = 1',
        });

        this.featureLayer.queryFeatures(query).then((results) => {
          const deleteEdits = {
            deleteFeatures: results.features
          };

          return this.applyEditsToLayer(deleteEdits).then((deleteCount) => {
            r(deleteCount);
          }).catch((error) => {
            j(error);
          });
        });
      } else {
        r(0);
      }
    });
  }

  initializeMap(): void {
    try {
      if (this.map) {
        this.dummyData = this.esri.grabData();
        this.fixMapData().then(() => {
          this.removeAllFeatureData().then(() => {
            this.featureLayer.renderer = this.buildRenderSettings();
            this.addFeatures().then((addedElements) => {
            });
          });
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  initMap(): void {
    this.dummyData = this.esri.grabData();
    this.fixMapData().then(() => {
      // this.map.layers.removeAll();
      this.removeAllFeatureData().then(() => {
        try {
          if (this.featureLayer) {
            this.featureLayer.destroy();
            this.featureLayer = null;
          }
        } catch (error) {
          console.log(error);
        }

        this.createFeatureLayers().then(() => {
          this.map.add(this.featureLayer);
        });
      });
    });
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
            geometry: 'polyline',
          }
        };
      });
      r();
    });
  }

  createFeatureLayers(): Promise<unknown> {
    return new Promise<void>( (r) => {
      this.featureLayer = new FeatureLayer(
          this.buildFeatureSettings('polyline', this.sortedMapData)
      );
      r();
    });
  }

  buildFeatureSettings(geometryType, data): any {
    return {
      source: data,
      renderer: this.buildRenderSettings(),
      fields: this.fields,
      objectIdField: 'ObjectID',
      geometryType,
      spatialReference: {
        wkid: 4326
      },
      id: 'test',
      title: 'test'
    };
  }

  buildRenderSettings(): any {
    let colour;
    switch (this.mapId) {
      case 'map1':
        colour = '#9ee86b';
        break;
      case 'map2':
        colour = '#9b7935';
        break;
      case 'map3':
        colour = '#ce5e42';
        break;
      case 'map4':
        colour = '#5da9fc';
        break;
      default:
        colour = '#c037bb';
        break;
    }

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

    this.store.select(SelectMapByID({id: this.mapId}))
      .pipe(filter(Map => Map !== null)) // NOTE: Remove all NULL Items
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((Map) => {
        this.mapService.setMapID(this.mapId);
        this.mapService.initializeMapView(this.mapViewEl, Map).then((storeView) => {
          this.map = storeView.map;
          this.view = storeView.view;
          this.initMap();
        }).catch(() => {
          this.ngUnsubscribe.next();
          this.ngUnsubscribe.complete();
        });
      });
  }

  ngOnDestroy(): void {
    this.removeAllFeatureData().then(() => {
      // NOTE: Delete successful
      try {
        this.featureLayer.destroy();
        this.featureLayer = null;
      } catch (error) {
        console.log(error);
      }

      this.mapService.removeMapViewContainer(this.mapViewEl);
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }).catch((error) => {
      console.log(error);
    });

  }
}
