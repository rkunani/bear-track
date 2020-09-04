import { Component } from '@angular/core';

@Component({
  templateUrl: "./track-list.component.html",
  styleUrls: ['./track-list.component.css']
})
export class TrackListComponent {
  isLoading = false;
  isAuthenticated = false;
  tracks = [
    { course: "CS162", semester: "Fall 2020", status: "open" },
    { course: "CS189", semester: "Spring 2020", status: "open" }
  ];  // dummy data for now


}
