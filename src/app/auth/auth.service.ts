import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';


@Injectable({ providedIn: 'root'})  // makes Angular aware of this service, creates only one instance for the app
export class AuthService {

  isAuthenticated = false;
  private authSubject = new Subject<boolean>();

  constructor(private httpClient: HttpClient, private router: Router) { }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getAuthSubjectListener() {
    return this.authSubject.asObservable();
  }

  createUser(name: string, phone: string) {
    // in future, maybe make a model for the payload
    return this.httpClient.post("http://localhost:3000/api/user/signup", {name: name, phone: phone});  // return promise to component
  }

  login(name: string, phone: string) {
    this.httpClient.post("http://localhost:3000/api/user/login", {name: name, phone: phone})
      .subscribe( (response) => {
        this.isAuthenticated = true;
        this.authSubject.next(true);
        this.router.navigate(['/tracks/list']);
      });
  }

  logout() {
    this.isAuthenticated = false;
    this.authSubject.next(false);
    this.router.navigate(['/']);
  }

}
