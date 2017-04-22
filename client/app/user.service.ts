import { Injectable } from '@angular/core';
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import {User} from "./models/user";

@Injectable()
export class UserService {

    private jwt() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            const headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }

    constructor(private http: Http) { }

    getAll() {
        return this.http.get('/api/v1/users', this.jwt()).map((response: Response) => response.json());
    }

    getById(_id: string) {
        return this.http.get('/api/v1/users/' + _id, this.jwt()).map((response: Response) => response.json());
    }

    create(user: User) {
        return this.http.post('/api/v1/users/register', user, this.jwt());
    }

}
