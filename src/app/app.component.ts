import { Component, OnDestroy, OnInit } from '@angular/core';
import { FirebaseAuthService } from "./providers/firebase-auth.service";
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { FirebaseDatabaseService } from "./providers/firebase-database.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';

  loggedIn: boolean = false;
  userEmail: String;
  hasProfile: boolean = false;

  authSub: Subscription;

  constructor(
    public authService: FirebaseAuthService,
    public databaseService: FirebaseDatabaseService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.authSub = this.authService.user.subscribe(user => {
      if (user == null) {
        this.loggedIn = false;
        this.userEmail = null;
      } else {
        console.log(user.email);
        // Logged in
        this.loggedIn = true;
        this.userEmail = user.email;

        this.databaseService.doesUserHaveProfile(user.email)
          .then(data => {
            this.hasProfile = data.hasProfile;
          })
      }
    })
  }
  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }
}


