import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  @Input()
  loggedIn: boolean;
  
  @Input()
  userEmail: string;

  @Input()
  hasProfile: boolean;
  
  constructor(private router: Router) { }

  ngOnInit() {
  }

  navigateToCreate() {
    this.router.navigate(['create'])
  }
  navigateToList() {
    this.router.navigate(['list'])
  }
}
