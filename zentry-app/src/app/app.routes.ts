import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { AltaResidentesComponent } from './alta-residentes/alta-residentes.component';
import { AltaInquilinoComponent } from './alta-inquilino/alta-inquilino.componente';
import { ResidentesPropietariosComponent } from './residentes-propietarios/residentes-propietarios.component';
import { ResidentesInquilinosComponent } from './residentes-inquilinos/residentes-inquilinos.component';
import { ResidentHomeComponent } from './resident-home/resident-home.component';
import { GenerateQrComponent } from './generate-qr/generate-qr.component';
import { GenerateQr2Component } from './generate qr (2)/generateqr2.component';
import { PanicButtonComponent } from './panic-button/panic-button.component';
import { NuevaReservaComponent } from './nueva-reserva/nueva-reserva.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin-home', component: AdminHomeComponent },
  { path: 'alta-residentes', component: AltaResidentesComponent },
  { path: 'alta-inquilino', component: AltaInquilinoComponent },
  { path: 'residentes-propietarios', component: ResidentesPropietariosComponent },
  { path: 'residentes-inquilinos', component: ResidentesInquilinosComponent },
  { path: 'residentes', redirectTo: 'residentes-propietarios', pathMatch: 'full' },
  { path: 'resident-home', component: ResidentHomeComponent },
  { path: 'generar-qr', component: GenerateQrComponent },
  { path: 'generar-qr-concurrente', component: GenerateQr2Component },
  { path: 'panic-button', component: PanicButtonComponent },
  { path: 'nueva-reserva', component: NuevaReservaComponent },
  { path: '**', redirectTo: 'login' }
];