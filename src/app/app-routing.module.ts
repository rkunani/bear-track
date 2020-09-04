import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrackListComponent } from './tracks/track-list/track-list.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { SignUpComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'mytracks', component: TrackListComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
