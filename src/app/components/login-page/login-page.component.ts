import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";

import { FirebaseAuthService } from "../../providers/firebase-auth.service";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  
  @Input()
  loggedIn: boolean;

  @Input()
  userEmail: string;

  email: string = "";
  password: string = "";

  constructor(
    private authService: FirebaseAuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }
  
  submitWithEmail(event: any) {
    event.preventDefault();
    
    if (this.email.length === 0 || this.password.length === 0) {
      alert("Please enter an email and password.");
      return;
    }

    this.authService.loginWithEmail(this.email, this.password)
      .catch(error => {
        alert("There was an error: " + error.message);
      })
    //alert("submitted by email" + this.email + this.password);
  }
  loginWithGoogle() {
    this.authService.loginWithGoogle();
    // alert("login with Google");
  }
  loginWithFacebook() {
    this.authService.loginWithFacebook();
    // alert("login with Facebook");
  }

  logout() {
    this.authService.logout();
  }

  signUp() {
    if (this.email.length === 0 || this.password.length === 0) {
      alert("Please enter an email and password.");
      return;
    }

    this.authService.signUpWithEmail(this.email, this.password)
      .catch(error => {
        alert("There was an error: " + error.message);
      })
  }
}
