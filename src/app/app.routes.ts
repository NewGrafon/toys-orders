import { Routes } from '@angular/router';
import {AppComponent} from "./app.component";
import {AuthComponent} from "./pages/auth/auth.component";
import {AdminComponent} from "./pages/admin/admin.component";
import {CreateOrderComponent} from "./pages/create-order/create-order.component";
import {OrdersListComponent} from "./pages/orders-list/orders-list.component";
import {CurrentOrderComponent} from "./pages/current-order/current-order.component";

export const routes: Routes = [
  { path: '', component: AuthComponent, pathMatch: 'full' },
  { path: 'admin', component: AdminComponent, pathMatch: 'full' },
  { path: 'create', component: CreateOrderComponent, pathMatch: 'full' },
  { path: 'list', component: OrdersListComponent, pathMatch: 'full' },
  { path: 'current', component: CurrentOrderComponent, pathMatch: 'full' },
];