import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';

import { OrderService } from '@manjeet-ecommerce/orders';
import { ProductService } from '@manjeet-ecommerce/products';
import { UserService } from '@manjeet-ecommerce/users';

@Component({
  selector: 'admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  statistics = [];
  isLoading = false;
  constructor(
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    combineLatest([
      this.orderService.getOrdersCount(),
      this.productService.getProductsCount(),
      this.userService.getUsersCount(),
      this.orderService.getTotalSales()
    ]).subscribe((values: any) => {
      this.statistics = values;
      this.isLoading = false;
    });
  }
}
