import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

// Components
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { Cartelera } from './pages/cartelera/cartelera';
import { Estrenos } from './pages/estrenos/estrenos';
import { Proximamente } from './pages/proximamente/proximamente';
import { SalasVip } from './pages/salas-vip/salas-vip';
import { Perfil } from './pages/user/perfil/perfil';
import { Reservas } from './pages/user/reservas/reservas';
import { Dashboard } from './pages/admin/dashboard/dashboard';
import { Home } from './pages/home/home';
import { CompraBoletos } from './pages/compra-boletos/compra-boletos';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' }, 
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'cartelera', component: Cartelera },
  { path: 'estrenos', component: Estrenos },
  { path: 'proximamente', component: Proximamente },
  { path: 'salas-vip', component: SalasVip },
  
  // User protected routes
  { path: 'perfil', component: Perfil, canActivate: [authGuard] },
  { path: 'reservas', component: Reservas, canActivate: [authGuard] },
  { path: 'comprar/:id', component: CompraBoletos, canActivate: [authGuard] },
  
  // Admin protected routes
  { path: 'admin', component: Dashboard, canActivate: [adminGuard] },
  
  { path: '**', redirectTo: '' }
];
