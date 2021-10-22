import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public page = 'esri1';
  public timeout = 2500;

  public seconds = (this.timeout / 1000);
  public minutes = (this.timeout / 60000).toFixed(2);
  public tabChange = 1;
  public mapName = '';

  public esriMaps: Array<string> = [];

  ngOnInit(): void {
    // NOTE: This will allocate the maps:
    //   map1
    //   map2
    //   map3...
    this.esriMaps = Array.from({length: 5}, (_, i) => 'map' + (++i));

    this.mapName = this.esriMaps[0];
    this.startPageTransitions();
  }

  startPageTransitions(): void {
    let index = 1;
    setInterval(() => {
      this.tabChange++;
      this.mapName = this.esriMaps[index++];
      if (index >= this.esriMaps.length) {
        index = 0;
      }
    }, this.timeout);
  }
}
