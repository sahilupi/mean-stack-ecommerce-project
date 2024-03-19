import { Component } from '@angular/core';
import { AuthService } from '@manjeet-ecommerce/users';

@Component({
  selector: 'ngshop-nav',
  templateUrl: './nav.component.html',
  styles: [],
})
export class NavComponent {

  constructor(private authService: AuthService) {}

  isUserLoggedIn() {
    return this.authService.isUserLoggedIn();
  }

  onLogout() {
    this.authService.deleteToken();
  }

}
