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
