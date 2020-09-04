import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  userIsAuthenticated = false;

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

  onLogOut() {
    this.authService.logout();
  }



}
