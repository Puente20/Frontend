import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin-home', component: AdminHomeComponent },
  { path: '**', redirectTo: 'login' }
];
