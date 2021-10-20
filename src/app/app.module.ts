import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EsriComponent } from './esri/esri.component';
import { StoreModule } from '@ngrx/store';
import {MapReducer} from './stores/reducers/map.reducer';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    EsriComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({
      maps: MapReducer
    }, {})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
