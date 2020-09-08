import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignUpComponent {
  isLoading = false;
  isConfirmed = false;

  constructor(private authService: AuthService) {

  }

  validatePhoneNo(field) {
    var phoneNumDigits = field.value.replace(/\D/g, '');

    var formattedNumber = phoneNumDigits;
    if (phoneNumDigits.length >= 6)
      formattedNumber = phoneNumDigits.substring(0, 3) + '-' + phoneNumDigits.substring(3, 6) + '-' + phoneNumDigits.substring(6);
    else if (phoneNumDigits.length >= 3)
      formattedNumber = phoneNumDigits.substring(0, 3) + '-' + phoneNumDigits.substring(3);

    field.value = formattedNumber;
  }

  onSignUp(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(form.value.name, form.value.phone)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.isConfirmed = true;
          console.log(response);
        },
        (error) => {
          this.isLoading = false;
          alert(error.error.message);
        }
      );
  }
}
