import { Injectable } from '@angular/core';
import {Http, Response} from '@angular/http';

@Injectable()
export class AuthenticationService {
// TODO : On test sans la config vu que c'est express qui call angular
    constructor(private http: Http) { }

    login(username: string, password: string) {
        return this.http.post('/api/v1/users/authenticate', { username: username, password: password })
            .map((response: Response) => {
                const user = response.json();
                if (user && user.token) { // Si json token c'est ok
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
            });
    }

    logout() {
        localStorage.removeItem('currentUser');
    }

}
