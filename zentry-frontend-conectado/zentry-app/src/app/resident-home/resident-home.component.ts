import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ActivityLogService, MovimientoResidente } from '../services/activity-log.service';
import { PanicButtonComponent } from '../panic-button/panic-button.component';

interface ResidentRequest {
  user: {
    first_name: string;
  };
}

@Component({
  selector: 'app-resident-home',
  standalone: true,
  imports: [CommonModule, PanicButtonComponent],
  templateUrl: './resident-home.component.html',
  styleUrl: './resident-home.component.css'
})
export class ResidentHomeComponent implements OnInit {
  request: ResidentRequest = {
    user: {
      first_name: 'Tomás'
    }
  };

  mostrarModalPanico: boolean = false;

  tabActiva: 'inicio' | 'usuario' = 'inicio';

  /** Lista reactiva que se muestra en la sección "Últimos movimientos" */
  ultimosMovimientos: MovimientoResidente[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private activityLog: ActivityLogService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    if (usuario?.first_name) {
      this.request.user.first_name = usuario.first_name;
    }
    this.activityLog.inicializarHistorial();
    this.cargarUltimosMovimientos();
  }

  cargarUltimosMovimientos(): void {
    this.ultimosMovimientos = this.activityLog.listarLocales()
      .sort((a, b) => Date.parse(b.fechaRegistro) - Date.parse(a.fechaRegistro));
  }

  trackByMovimientoId(_index: number, item: MovimientoResidente): number {
    return item.id;
  }

  irAQr(): void {
    void this.router.navigate(['/generar-qr']);
  }

  irAInvitaciones(): void {
    void this.router.navigate(['/invitaciones-activas']);
  }

  IrAPanic(): void {
    this.mostrarModalPanico = true;
  }

  cerrarModalPanico(): void {
    this.mostrarModalPanico = false;
  }

  confirmarEmergencia(): void {
    this.mostrarModalPanico = false;
  }

  IrANuevaReserva(): void {
    void this.router.navigate(['/nueva-reserva']);
  }

  cambiarTab(tab: 'inicio' | 'usuario'): void {
  this.tabActiva = tab;
}

cerrarSesion(): void {
  this.authService.logout();
  void this.router.navigate(['/login']);
}

}