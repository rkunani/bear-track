import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';


@Injectable({ providedIn: 'root'})  // makes Angular aware of this service, creates only one instance for the app
export class AuthService {

  isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
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
    this.httpClient.post<{token: string, expiresIn: number}>("http://localhost:3000/api/user/login", {name: name, phone: phone})
      .subscribe( (response) => {
        this.token = response.token;  // saves the token in the service to be attached as a header to outgoing requests
        if (this.token) {
          const expiresInDuration = response.expiresIn;  // in units of seconds
          this.setTokenTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.authSubject.next(true);
          const now = Date.now();
          const expirationDate = new Date(now + (expiresInDuration * 1000));
          this.saveAuthData(this.token, expirationDate);
          this.router.navigate(['/tracks/list']);
        }
      });
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authSubject.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate)
    }
  }

  private setTokenTimer(duration: number) {
    this.tokenTimer = setTimeout( () => { this.logout(); }, duration * 1000);  // expiration measured in milliseconds
  }

}
