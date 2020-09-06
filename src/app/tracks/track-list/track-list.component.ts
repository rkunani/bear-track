import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from 'src/app/auth/auth.service';
import { TracksService } from '../tracks.service';
import { Track } from '../track.model';

@Component({
  templateUrl: "./track-list.component.html",
  styleUrls: ['./track-list.component.css']
})
export class TrackListComponent implements OnInit, OnDestroy {
  isLoading = false;
  userIsAuthenticated = false;
  private authSub: Subscription;
  private tracksSub: Subscription;
  tracks: Track[] = [];

  constructor(private tracksService: TracksService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.tracksService.getTracks();  // starts an async HTTP get that the next line sets up a listener for
    this.tracksSub = this.tracksService.getTrackUpdateListener().subscribe(
      (tracks: Track[]) => {
        this.isLoading = false;
        this.tracks = tracks;
      }
    );
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
    this.tracksSub.unsubscribe();
  }

  onDeleteTrack(trackId: string) {
    this.tracksService.deleteTrack(trackId);
  }

}
