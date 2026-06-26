import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NAVIGATION } from '../../../core/constants/routes';
import { NavigationHandlerService } from '../../../core/services/navigationHandler.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true,
})
export class Header {
  #navigate = inject(NavigationHandlerService);

  navItems = [
    { label: 'Sets', route: NAVIGATION.products(), icon: 'dashboard_customize' },
    { label: 'Wunschliste', route: NAVIGATION.wishlist(), icon: 'favorite' },
  ];

  navigateToHome() {
    this.#navigate.toProducts();
  }
}
