import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RegistrationComponent} from '../registration/registration.component';
import {HomeComponent} from "../home/home.component";
import {AuthGuard} from "../auth.guard";
import {LoginComponent} from "../login/login.component";

const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard]},
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegistrationComponent },
    { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
