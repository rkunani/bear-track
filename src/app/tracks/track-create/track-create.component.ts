import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  templateUrl: './track-create.component.html',
  styleUrls: ['./track-create.component.css']
})
export class TrackCreateComponent {
  isLoading = false;
  courses = ["CS162", "CS189", "Math 1A"];
  semesters = ["Fall 2020", "Spring 2020", "Summer 2020"];


  onCreateTrack(form: NgForm) {
    if (form.invalid) {
      return;
    }
    console.log(form.value);
  }
}
