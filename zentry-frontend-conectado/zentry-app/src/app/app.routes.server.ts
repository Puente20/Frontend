import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'residentes-propietarios',
    renderMode: RenderMode.Client
  },
  {
    path: 'residentes-inquilinos',
    renderMode: RenderMode.Client
  },
  {
    path: 'editar-residentes',
    renderMode: RenderMode.Client
  },
  {
    path: 'escanear-qr',
    renderMode: RenderMode.Client
  },
  {
    path: 'historial-guardia',
    renderMode: RenderMode.Client
  },
  {
    path: 'pestana-egresos',
    renderMode: RenderMode.Client
  },
  {
    path: 'registrar-egreso',
    renderMode: RenderMode.Client
  },
  {
    path: 'resident-home',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
