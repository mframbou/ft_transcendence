import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  public test = 'Suce';
  private _random = '';

  get random(): string {
    return this._random;
  }

  set random(val: string) {
    //do some extra work here
    this._random = val;
  }

  pouetpouet()
  {
    this.random = '';
  }
}

