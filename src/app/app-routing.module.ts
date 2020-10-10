import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrackListComponent } from './tracks/track-list/track-list.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { SignUpComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { TrackCreateComponent } from './tracks/track-create/track-create.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'login', component: LoginComponent },
  { path: 'tracks/create', component: TrackCreateComponent, canActivate: [AuthGuard] },
  { path: 'tracks/list', component: TrackListComponent, canActivate: [AuthGuard] },
  { path: 'tracks/edit/:trackId', component: TrackCreateComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
