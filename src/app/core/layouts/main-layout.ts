import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header';
import { FooterComponent } from '../../shared/components/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  standalone: true,
  template: `<app-header />
    <router-outlet />
    <app-footer />`,
})
export class MainLayoutComponent {}
