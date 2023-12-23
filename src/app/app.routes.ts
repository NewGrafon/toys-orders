import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { AdminComponent } from './pages/admin/admin.component';
import { CreateOrderComponent } from './pages/create-order/create-order.component';
import { OrdersListComponent } from './pages/orders-list/orders-list.component';
import { CurrentOrdersComponent } from './pages/current-orders/current-orders.component';
import { CreateUserComponent } from './pages/create-user/create-user.component';
import { EditUserComponent } from './pages/edit-user/edit-user.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    pathMatch: 'full',
  },
  {
    path: 'admin',
    component: AdminComponent,
    pathMatch: 'full',
  },
  {
    path: 'create-user',
    component: CreateUserComponent,
    pathMatch: 'full',
  },
  {
    path: 'edit-user/:id',
    component: EditUserComponent,
    pathMatch: 'full',
  },
  {
    path: 'create',
    component: CreateOrderComponent,
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: OrdersListComponent,
    pathMatch: 'full',
  },
  // {
  //   path: 'current',
  //   component: CurrentOrdersComponent,
  //   pathMatch: 'full',
  // },
];
