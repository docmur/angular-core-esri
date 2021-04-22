import {
  Component,
  OnInit,
  OnDestroy, SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  public page = 'dashboard';
  public timeout = 30000;
  public stop = true;

  ngOnInit(): void {
    this.stopToggle(true);
  }

  stopToggle(fromInit: boolean = false): void {
    const buttons = ['dashboard', 'esri1', 'esri2', 'esri3', 'esri4', 'esri5'];
    let index = 0;

    if (fromInit === false) {
      this.stop = !this.stop;
    }

    if (this.stop === true) {
      const cycleInterval = setInterval(() => {
        this.page = buttons[index];
        index++;
        if (index >= buttons.length) {
          index = 0;
        }
      }, this.timeout);
    }
  }

  ngOnDestroy(): void {
  }
}
