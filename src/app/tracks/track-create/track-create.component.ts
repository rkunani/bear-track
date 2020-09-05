import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { TracksService } from '../tracks.service';

@Component({
  templateUrl: './track-create.component.html',
  styleUrls: ['./track-create.component.css']
})
export class TrackCreateComponent implements OnInit {
  isLoading = false;
  courses = ["CS162", "CS189", "Math 1A"];
  semesters = ["Fall 2020", "Spring 2020", "Summer 2020"];
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
            return course.abbreviation + " " + course.course_number;
          })
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
