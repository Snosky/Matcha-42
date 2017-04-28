import { Injectable } from '@angular/core';
import {Headers, Http } from '@angular/http';
import { User } from './models/user';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {

    private headers = new Headers({ 'Content-Type': 'application/json' });

    constructor(private http: Http) { }

    create(user: User): Promise<User> {
        return this.http
            .post('/api/user', JSON.stringify(user), {headers: this.headers})
            .toPromise()
            .then(res => res.json().data as User)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error);
        return Promise.reject(error.message || error);
    }
}
