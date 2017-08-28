import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import ProfileModel from '../../models/userModel';
import { FirebaseAuthService } from "../../providers/firebase-auth.service";
import { FirebaseStorageService } from "../../providers/firebase-storage.service";
import { FirebaseDatabaseService } from "../../providers/firebase-database.service";
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

import * as moment from 'moment';

@Component({
  selector: 'app-create-page',
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.css']
})
export class CreatePageComponent implements OnInit, OnDestroy {

  model: ProfileModel;
  birthdateString: string;
  skillsEntry: string = "";
  formInvalid: boolean = false;
  currentPhoto: File;
  isEditing: boolean = false;

  authSub: Subscription;

  constructor(
    public router: Router,
    public authService: FirebaseAuthService,
    public storageService: FirebaseStorageService,
    public databaseService: FirebaseDatabaseService,
  ) { }

  ngOnInit() {
    this.model = new ProfileModel();
    this.authSub = this.authService.user.subscribe(user => {
      if (user == null) {
        return;
      }

      this.model.email = user.email;
      this.databaseService.doesUserHaveProfile(user.email)
        .then(data => {
          console.log("hasProfile", data);
          this.isEditing = data.hasProfile;
          
          if (data.hasProfile) {
            this.databaseService.getProfile(data.profileKey)
              .then(data => {
                this.model = data;
                //console.log(data);

                // Format birthday
                let birthdateString = moment(new Date( data.birthdate)).format("YYYY-MM-DD");
                this.birthdateString = birthdateString;

                // Format skills
                this.skillsEntry = data.skills.join(', ');
              })
          }

        })
    })
 
  }
  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  birthdateChange(newStr) {
    this.birthdateString = newStr;
    this.model.birthdate = new Date(newStr).valueOf();
    
    // console.log(this.model.birthdate);
  }

  onChangeSkills(newText, index) {
    console.log("change", newText, index);
    let modelSkills = this.model.skills;
    this.model.skills =
      this.skillsEntry.split(',')
        .map(skill => skill.trim());
  }

  onChangeFile(event) {
    let files = event.srcElement.files;
    // console.log(files);
    this.currentPhoto = files[0];
    console.log(files[0].type);
    
  }

  formSubmit(event) {
    event.preventDefault();

    // Validate form
    if (this.model.name == "" || this.model.phone == "" || this.model.birthdate == null) {
      //alert("Please fill in all fields!");
      this.formInvalid = true;
      return;
    } else {
      this.formInvalid = false;
    }

    if (!this.isEditing && this.currentPhoto == null) {
      alert("Please give a profile photo!");
      return;
    }

    if (this.isEditing && this.currentPhoto == null) {
      // You haven't chosen a new photo, so just update
      this._saveProfile(this.model);
      return;
    }
  
    let photo = this.currentPhoto;
    console.log(photo);
    console.log(this.model);
    
    this._uploadFileAndSaveProfile(this.model.email, photo)
  }

  _uploadFileAndSaveProfile(email: string, photo: File) {
    this.storageService.uploadFile(email, photo, this.isEditing)
    .then(({filename, downloadUrl}) => {
      this.model.photoUrl = downloadUrl;

      this._saveProfile(this.model);
    })
  }

  _saveProfile(model: ProfileModel) {
    this.databaseService.saveNewProfile(model, this.isEditing)
    .then(_ => {
      this.router.navigate(['']);
    })
  }

}
