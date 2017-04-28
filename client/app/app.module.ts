import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { RegistrationComponent } from './registration/registration.component';
import {AppRoutingModule} from './app-routing/app-routing.module';
import {MaterialModule} from './material/material.module';

import 'hammerjs';
import { AlertComponent } from './alert/alert.component';
import {AlertService} from './alert.service';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import {AuthGuard} from './auth.guard';
import {AuthenticationService} from './authentication.service';
import {UserService} from './user.service';
import { EqualValidatorDirective } from './equal-validator.directive';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule,
        MaterialModule
    ],
    declarations: [
        AppComponent,
        RegistrationComponent,
        AlertComponent,
        HomeComponent,
        LoginComponent,
        EqualValidatorDirective
    ],
    providers: [AlertService, AuthGuard, AuthenticationService, UserService],
    bootstrap: [AppComponent]
})
export class AppModule { }
