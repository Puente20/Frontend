import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-generate-qr',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './generate-qr.component.html',
  styleUrl: './generate-qr.component.css'
})
export class GenerateQrComponent {}
