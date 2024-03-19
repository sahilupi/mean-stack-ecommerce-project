import { Route } from '@angular/router';
import { UserAuthGuard } from '@manjeet-ecommerce/users';
import { CheckoutComponent } from '@manjeet-ecommerce/orders';
import { HomeComponent } from './pages/home/home.component';

export const appRoutes: Route[] = [
  {
    path: '', component: HomeComponent, data: { title: 'Home' }
  },
  {
    path: 'checkout', component: CheckoutComponent, canActivate: [UserAuthGuard], data: { title: 'Checkout' }
  },
];
