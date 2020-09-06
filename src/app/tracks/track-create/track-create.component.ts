import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { TracksService } from '../tracks.service';
import { CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY } from '@angular/cdk/overlay/overlay-directives';

@Component({
  templateUrl: './track-create.component.html',
  styleUrls: ['./track-create.component.css']
})
export class TrackCreateComponent implements OnInit {
  isLoading = false;
  courses = [];
  semesters = [];
  statuses = ["Open", "Closed"];

  constructor(private tracksService: TracksService, private httpClient: HttpClient) { }

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
    this.tracksService.createTrack(form.value.course, form.value.semester, form.value.status);
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
        }
      );  // Angular automatically unsubscribes for us
  }

  private getSemesters() {
    const currDate = new Date();
    const currMonth = currDate.getMonth();
    const currYear = currDate.getFullYear();
    var years;
    var terms;
    if (currMonth >= 10 && currMonth <= 12) {  // in this interval, want to look at next spring's classes
      terms = ["Spring", "Fall"];
      years = [currYear+1, currYear];
    }
    else if (currMonth >= 1 && currMonth <= 2) {
      terms = ["Spring", "Fall"];
      years = [currYear, currYear];
    }
    else if (currMonth >= 3 && currMonth <=9) {
      terms = ["Fall", "Spring"];
      years = [currYear, currYear];
    }
    var semesters = [];
    for (var i in terms) {
      semesters.push(terms[i] + " " + years[i]);
    }
    return semesters;
  }
}
