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

  ngOnInit(): void {
    this.startPageTransitions();
  }

  startPageTransitions(): void {
    const buttons = ['esri1', 'esri2', 'esri3', 'esri4', 'esri5'];
    let index = 1;

    setInterval(() => {
      this.page = buttons[index++];
      this.tabChange++;
      if (index >= buttons.length) {
        index = 0;
      }
    }, this.timeout);
  }
}
