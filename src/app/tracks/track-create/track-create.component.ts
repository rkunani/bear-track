import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { TracksService } from '../tracks.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Track } from '../track.model';

@Component({
  templateUrl: './track-create.component.html',
  styleUrls: ['./track-create.component.css']
})
export class TrackCreateComponent implements OnInit {
  isLoading = false;
  courses = [];
  semesters = [];
  statuses = ["Open", "Closed"];
  private mode = "create";
  private trackId: string;
  track: Track;
  course: any;

  constructor(private tracksService: TracksService, private httpClient: HttpClient,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.isLoading = true;
    this.getCourses();  // get courses from Berkeleytime
    this.semesters = this.getSemesters();
    this.isLoading = false;
  }

  onCreateTrack(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode == "create") {
      this.tracksService.createTrack(form.value.course, form.value.semester, form.value.status);
    } else {
      console.log(form.value.course, form.value.semester, form.value.status);
      // this.tracksService.updateTrack();
    }
  }

  private getCourses() {
    this.httpClient.get<{courses: any}>("https://www.berkeleytime.com/api/enrollment/enrollment_json/?form=long")
      .pipe(map(  // this map is the rxjs operator
        (response) => {
          return response.courses.map( (course) => {  // this map is the built-in
            return {
              course_id: course.id,
              course_code: course.abbreviation,
              course_number: course.course_number,
              course_name: course.title
            };
          });
        }
      ))
      .subscribe(
        (transformedCourses) => {
          this.courses = transformedCourses;
          this.loadTrack();  // sets this.track and this.course attributes
        }
      );  // Angular automatically unsubscribes for us
  }

  private getSemesters() {
    const currDate = new Date();
    const currMonth = currDate.getMonth();
    const currYear = currDate.getFullYear();
    var years;
    var terms;
    if (currMonth >= 9 && currMonth <= 11) {  // in this interval, want to look at next spring's classes
      terms = ["Spring", "Fall"];
      years = [currYear+1, currYear];
    }
    else if (currMonth >= 0 && currMonth <= 1) {
      terms = ["Spring", "Fall"];
      years = [currYear, currYear];
    }
    else if (currMonth >= 2 && currMonth <=8) {
      terms = ["Fall", "Spring"];
      years = [currYear, currYear];
    }
    var semesters = [];
    for (var i in terms) {
      semesters.push(terms[i] + " " + years[i]);
    }
    return semesters;
  }

  private loadTrack() {
    /* Pre-load the current track if the component is in edit mode */
    this.route.paramMap.subscribe( (paramMap: ParamMap) => {  // this is an observable bc the same component can be loaded with different data
      if (paramMap.has('trackId')) {
        this.mode = 'edit';
        this.trackId = paramMap.get('trackId');
        this.isLoading = true;  // to show the loading spinner
        this.tracksService.getTrack(this.trackId).subscribe(
          (trackData) => {
            this.isLoading = false;
            this.track = {
              id: trackData._id,
              course_id: trackData.course_id,
              course_code: trackData.course_code,
              semester: trackData.semester,
              status: trackData.status,
              notified: trackData.notified
            };
            this.course = this.courses.find( (c) => { return c.course_id == this.track.course_id; } );
          }
        );
      }
      else {
        this.mode = 'create';
      }
    });
  }
}
