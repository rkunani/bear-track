import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // intercepts all outgoing requests from Angular app and adds a token if the user is logged in
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.authService.getToken();
    const newReq = req.clone({ headers: req.headers.set("Authorization", "Bearer " + authToken) });
    return next.handle(newReq);
  }

}
