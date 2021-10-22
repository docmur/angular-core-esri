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
import {MapList} from '../stores/models/map.model';
import {AddMapAction} from '../stores/actions/map.actions';
import {SelectMapByID} from '../stores/selectors/map.selectors';
import {filter, takeUntil} from 'rxjs/operators';
import {EsriMapService} from '../service/esri-map.service';
import {Subject, Subscription} from 'rxjs';

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

  initializeMap(): void {
    try {
      if (this.map) {
        this.dummyData = this.esri.grabData();
        this.map.removeAll();
        this.fixMapData().then(() => {
          this.createFeatureLayers().then(() => {
            this.map.add(this.featureLayer);
          });
        });
      }
    } catch (error) {
      console.log(error);
    }
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
        console.log('Triggered');

        this.mapService.setMapID(this.mapId);
        this.mapService.initializeMapView(this.mapViewEl, Map).then((storeView) => {
          this.map = storeView.map;
          this.view = storeView.view;
          this.initializeMap();
        }).catch(() => {
          this.ngUnsubscribe.next();
          this.ngUnsubscribe.complete();
        });
      });
  }

  ngOnDestroy(): void {
    this.featureLayer = null;
    this.sortedMapData = null;
    this.mapService.removeMapViewContainer(this.mapViewEl);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
