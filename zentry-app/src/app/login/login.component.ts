import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  rolSeleccionado: 'residente' | 'administrador' | 'guardia' = 'administrador';
  mostrarPassword: boolean = false;

  constructor(private router: Router) {}

  cambiarRol(rol: 'residente' | 'administrador' | 'guardia'): void {
    this.rolSeleccionado = rol;
  }

  ojoContra(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  iniciarSesion(): void {
    if (this.rolSeleccionado === 'administrador') {
      this.router.navigate(['/admin-home']);
    }
  }
}