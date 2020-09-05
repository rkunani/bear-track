import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  templateUrl: "./track-list.component.html",
  styleUrls: ['./track-list.component.css']
})
export class TrackListComponent implements OnInit, OnDestroy {
  isLoading = false;
  userIsAuthenticated = false;
  private authSub: Subscription;
  tracks = [
    { course: "CS162", semester: "Fall 2020", status: "open" },
    { course: "CS189", semester: "Spring 2020", status: "open" }
  ];  // dummy data for now

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuthenticated();
    this.authSub = this.authService.getAuthSubjectListener()
      .subscribe(
        (isAuthenticated) => {
          this.userIsAuthenticated = isAuthenticated;
        }
      );
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

  onDeleteTrack() {
    console.log("deleting track");
  }

}
