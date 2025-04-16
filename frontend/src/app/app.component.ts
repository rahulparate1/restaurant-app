import { Component } from '@angular/core';
import * as AOS from 'aos';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  ngOnInit(): void {
    AOS.init({
      duration: 1000, // animation duration
      once: true // whether animation should happen only once
    });
  }
}
