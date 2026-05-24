import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { TicketsComponent } from './pages/tickets/tickets.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { OrganizerDashboardComponent } from './pages/organizer-dashboard/organizer-dashboard.component';
import { EventFormComponent } from './pages/event-form/event-form.component';
import { AdminComponent } from './pages/admin/admin.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard, organizerGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'EventHub House | Eventi House'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login | EventHub House'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Registrati | EventHub House'
  },
  {
    path: 'eventi/:id',
    component: EventDetailComponent,
    title: 'Evento | EventHub House'
  },
  {
    path: 'biglietti',
    component: TicketsComponent,
    canActivate: [authGuard],
    title: 'I miei biglietti | EventHub House'
  },
  {
    path: 'profilo',
    component: ProfileComponent,
    canActivate: [authGuard],
    title: 'Profilo | EventHub House'
  },
  {
    path: 'organizer',
    component: OrganizerDashboardComponent,
    canActivate: [organizerGuard],
    title: 'Dashboard Organizer | EventHub House'
  },
  {
    path: 'organizer/nuovo-evento',
    component: EventFormComponent,
    canActivate: [organizerGuard],
    title: 'Crea Evento | EventHub House'
  },
  {
    path: 'organizer/modifica-evento/:id',
    component: EventFormComponent,
    canActivate: [organizerGuard],
    title: 'Modifica Evento | EventHub House'
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
    title: 'Admin | EventHub House'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
