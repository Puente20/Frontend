import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-escanear-qr',
  standalone: true,
  templateUrl: './escanear-qr.component.html',
  styleUrl: './escanear-qr.component.css'
})
export class EscanearQrComponent {

  constructor(private router: Router) {}

  volver(): void {
    this.router.navigate(['/guardia-home']);
  }

}