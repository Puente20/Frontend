import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { ResidentHomeComponent } from './resident-home/resident-home.component';
import { GenerateQrComponent } from './generate-qr/generate-qr.component';
import { PanicButtonComponent } from './panic-button/panic-button.component';
import { NuevaReservaComponent } from './nueva-reserva/nueva-reserva.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin-home', component: AdminHomeComponent },
  { path: 'resident-home', component: ResidentHomeComponent },
  { path: 'generar-qr', component: GenerateQrComponent },
  { path: 'panic-button', component: PanicButtonComponent },
  { path: 'nueva-reserva', component: NuevaReservaComponent },
  { path: '**', redirectTo: 'login' }
];
