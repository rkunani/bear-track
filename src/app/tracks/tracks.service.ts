import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Track } from './track.model';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.backendUrl + "tracks/";

@Injectable({ providedIn: 'root'})  // makes Angular aware of this service, creates only one instance for the app
export class TracksService {

  private tracks: Track[] = [];
  private tracksUpdated = new Subject<Track[]>();

  constructor(private httpClient: HttpClient, private router: Router) { }

  createTrack(course: any, semester: string, status: string) {
    const track: Track = {
      id: null,
      course_id: course.course_id,
      course_code: course.course_code + " " + course.course_number,
      semester: semester,
      status: status,
      notified: false
    };
    this.httpClient.post<{message: string, trackId: string}>(BACKEND_URL + "create", track)
      .subscribe(
        (response) => {
          track.id = response.trackId;
          this.tracks.push(track);  // updates local tracks array upon confirmation of successful add on server side
          this.tracksUpdated.next([...this.tracks]);  // "emits" that tracks have been updated
          this.router.navigate(["/tracks/list"]);  // redirect to track list after adding post
        }
      )
  }

  getTracks() {
    this.httpClient.get<{message: string, tracks: any}>(BACKEND_URL)
      .pipe(map(  // this map is the rxjs operator
        (response) => {
          return response.tracks.map( (track) => {  // this map is the built-in
            return {
              course_code: track.course_code,
              semester: track.semester,
              status: track.status,
              notified: track.notified,
              id: track._id  // this fixes the issue that Mongo defaults the id field to _id and our frontend model requires "id"
            }
          })
        }
      ))
      .subscribe(
        (transformedTracks) => {
          this.tracks = transformedTracks;
          this.tracksUpdated.next([...this.tracks]);
        }
      );  // Angular automatically unsubscribes for us
  }

  getTrack(trackId: string) {
    return this.httpClient.get<{_id: string,course_code: string, course_id: number, creator: string, notified: boolean, semester: string, status: string}>(BACKEND_URL + trackId);
  }

  deleteTrack(trackId: string) {
    this.httpClient.delete(BACKEND_URL + trackId)
      .subscribe( (response) => {
        const updatedTracks = this.tracks.filter( (track) => track.id !== trackId );
        this.tracks = updatedTracks;
        this.tracksUpdated.next([...this.tracks]);
      } );
  }

  activateTrack(trackId: string) {
    const newTrack = { id: trackId };
    this.httpClient.put(BACKEND_URL + "activate/" + trackId, newTrack)
      .subscribe( (response) => {
        console.log(response);
      });
  }

  getTrackUpdateListener() {
    return this.tracksUpdated.asObservable();  // returns an object from which we can listen but not emit
  }
}
