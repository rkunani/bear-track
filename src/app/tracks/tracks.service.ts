import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { Track } from './track.model';

@Injectable({ providedIn: 'root'})  // makes Angular aware of this service, creates only one instance for the app
export class TracksService {

  private tracks: Track[] = [];
  private tracksUpdated = new Subject<Track[]>();

  constructor(private httpClient: HttpClient, private router: Router) { }

  createTrack(course: string, semester: string, status: string) {
    const track = { id: null, course: course, semester: semester, status: status };
    this.httpClient.post<{message: string, trackId: string}>("http://localhost:3000/api/track/create", track)
      .subscribe(
        (response) => {
          track.id = response.trackId;
          console.log(track);
          this.tracks.push(track);  // updates local tracks array upon confirmation of successful add on server side
          this.tracksUpdated.next([...this.tracks]);  // "emits" that tracks have been updated
          this.router.navigate(["/tracks/list"]);  // redirect to track list after adding post
        }
      )
  }
}
