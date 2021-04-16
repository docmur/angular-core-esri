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
export class AppComponent implements OnInit, OnDestroy {
  public page: string = 'dashboard';

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }
}
