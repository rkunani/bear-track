import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { TracksService } from '../tracks.service';

@Component({
  templateUrl: './track-create.component.html',
  styleUrls: ['./track-create.component.css']
})
export class TrackCreateComponent {
  isLoading = false;
  courses = ["CS162", "CS189", "Math 1A"];
  semesters = ["Fall 2020", "Spring 2020", "Summer 2020"];
  status = ["Open", "Closed"];

  constructor(private tracksService: TracksService) { }

  onCreateTrack(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.tracksService.createTrack(form.value.course, form.value.semester, form.value.status);
  }
}
