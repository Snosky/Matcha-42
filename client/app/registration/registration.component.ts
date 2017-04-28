import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../user.service";
import {AlertService} from "../alert.service";
import {Subject} from "rxjs/Subject";
import {User} from "../models/user";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
    model = new User(null, null);

    constructor(
        private router: Router,
        private userService: UserService,
        private alertService: AlertService,
    ) { }

    /*register() {
        this.loading = true;
        this.userService.create(this.model)
            .subscribe(
                data => {
                    this.alertService.success('Registration successful', true);
                    this.router.navigate(['/login']);
                },
                error => {
                    this.alertService.error(error._body);
                    this.loading = false;
                }
            );
    }*/

    onSubmit() {
        this.userService.create(this.model)
            .then(
                data => {
                    this.alertService.success('Registration successful', true);
                    this.router.navigate(['/login']);
                },
                error => {
                    this.alertService.error(error._body);
                }
            );
    }

}
