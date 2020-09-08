import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) { }

  validatePhoneNo(field) {
    var phoneNumDigits = field.value.replace(/\D/g, '');

    var formattedNumber = phoneNumDigits;
    if (phoneNumDigits.length >= 6)
      formattedNumber = phoneNumDigits.substring(0, 3) + '-' + phoneNumDigits.substring(3, 6) + '-' + phoneNumDigits.substring(6);
    else if (phoneNumDigits.length >= 3)
      formattedNumber = phoneNumDigits.substring(0, 3) + '-' + phoneNumDigits.substring(3);

    field.value = formattedNumber;
  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.authService.login(form.value.name, form.value.phone);
  }

}
