import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

enableProdMode();

const disableLog = true;
if (window && disableLog) {
    window.console.log = () => {
    };

    window.console.info = () => {
    };
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
