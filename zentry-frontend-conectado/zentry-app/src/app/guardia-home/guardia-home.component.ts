import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval, startWith, switchMap, EMPTY, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { EmergenciasService, AlertaEmergencia } from '../services/emergencias.service';

@Component({
  selector: 'app-guardia-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guardia-home.component.html',
  styleUrl: './guardia-home.component.css'
})
export class GuardiaHomeComponent implements OnInit, OnDestroy {
  alertas: AlertaEmergencia[] = [];
  procesando = false;
  errorAlerta = '';
  private subs?: Subscription;
  constructor(private router: Router, private auth: AuthService, private emergencias: EmergenciasService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subs = interval(2500).pipe(
      startWith(0),
      switchMap(() => this.emergencias.pendientes().pipe(catchError(() => EMPTY)))
    ).subscribe(alertas => { this.alertas = alertas; this.cdr.markForCheck(); });
  }
  ngOnDestroy(): void { this.subs?.unsubscribe(); }
  get alertaActual(): AlertaEmergencia | undefined { return this.alertas[0]; }
  responder(accion: 'enviar_movil' | 'rechazar'): void {
    const alerta = this.alertaActual;
    if (!alerta || this.procesando) return;
    let motivo = '';
    if (accion === 'rechazar') {
      const valor = window.prompt('Motivo obligatorio para rechazar la emergencia:');
      if (valor === null) return;
      motivo = valor.trim();
      if (!motivo) { this.errorAlerta = 'El motivo de rechazo es obligatorio.'; return; }
    }
    this.errorAlerta = '';
    this.procesando = true;
    this.emergencias.responder(alerta.id, accion, motivo).subscribe({
      next: () => { this.alertas = this.alertas.filter(a => a.id !== alerta.id); this.procesando = false; },
      error: (err) => { this.errorAlerta = err.error?.detail || 'No se pudo registrar la respuesta.'; this.procesando = false; }
    });
  }
  irAEscanearQR(): void { void this.router.navigate(['/escanear-qr']); }
  irARegistrarEgreso(): void { void this.router.navigate(['/registrar-egreso']); }
  irAHistorial(): void { void this.router.navigate(['/historial-guardia']); }
  cerrarSesion(): void { this.auth.logout(); void this.router.navigate(['/login']); }
}

