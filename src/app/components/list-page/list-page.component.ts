import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseDatabaseService } from "../../providers/firebase-database.service";
import ProfileModel from "../../models/userModel";
import { FirebaseAuthService } from "../../providers/firebase-auth.service";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.css']
})
export class ListPageComponent implements OnInit, OnDestroy {

  searchTerm: string = "";
  skillsSearchTerm: string = "";

  users: ProfileModel[];
  userEmail: string;
  usersFromDB: ProfileModel[];

  authSub: Subscription;
  likesSub: Subscription;

  constructor(
    private databaseService: FirebaseDatabaseService,
    public authService: FirebaseAuthService,
  ) { 
  }

  ngOnInit() {
    this.authSub = this.authService.user.subscribe(user => {
      if (user == null) {
        this.userEmail = null;
      } else {
        this.userEmail = user.email;
      }
    })

    this.databaseService.getAllProfiles()
      .then(users => {
        console.log(users);
        this.usersFromDB = users;
        this.users = this.usersFromDB;

        // Likes sub
        this.likesSub = this.databaseService.likesStream
        .subscribe(
          nextVal => {
            // console.log(nextVal);
            // update likes
            this.usersFromDB = this.usersFromDB
              .map(user => {
                if (user.key == nextVal.profileKey) {
                  user.likes = nextVal.likesData;
                }
                return user;
              })
          },
          errorVal => {
  
          }
        )
      })
  }

  ngOnDestroy(): void {
    this.likesSub.unsubscribe();
    this.authSub.unsubscribe();
  }

  onLike(event, idx) {
    
    let profile = this.users[idx];
    
    let index = profile.likes.indexOf(this.userEmail);
    console.log("index of likes: " + index);
    
    if (index >= 0) {
      profile.likes.splice(index, 1);
      // this.databaseService.removeLikeFromProfileByUser(profile.key, this.userEmail);
    } else {
      this.users[idx].likes.push(this.userEmail);
      // this.databaseService.addLikeToProfileByUser(profile.key, this.userEmail);
    }
    
    this.databaseService.toggleLikeForProfileByUser(profile.key, this.userEmail);
    
  }

  filterUsers() {
    // console.log(this.searchTerm);
    if (this.skillsSearchTerm.length === 0) {
      this.users = this._fu(this.usersFromDB)
    } else {
      this.users = this._fu(this._fs(this.usersFromDB))
    }
  }

  _fu(array) {
    array.map(item => {
      item.visible = item.name.toUpperCase().includes(this.searchTerm.toUpperCase());
      return item;
    })
    return array
    // return array.filter(user => 
    //   user.name.toUpperCase().includes(this.searchTerm.toUpperCase())
    // )
  }
  _fs(array) {
    array.map(item => {
      let numOfSkills =
        item.skills
          .filter(skill => 
            skill.toUpperCase()
            .includes(this.skillsSearchTerm.toUpperCase())
          ).length
      item.visible = numOfSkills > 0;
      return item;
    })
    return array;
    // return array.filter(user => {
    //   return (user.skills
    //     .filter(skill => 
    //       skill.toUpperCase()
    //       .includes(this.skillsSearchTerm.toUpperCase())
    //     ).length > 0)
    // })
  }

  filterBySkill() {
    if (this.searchTerm.length === 0) {
      this.users = this._fs(this.usersFromDB)
    } else {
      this.users = this._fu(this._fs(this.usersFromDB))
    }
  }

  formatBirthdate(date: Date): string {
    return date.toString();
  }
}
