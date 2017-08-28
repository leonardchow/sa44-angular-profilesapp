import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app'; // for typings
import { FirebaseApp } from 'angularfire2'; // for methods
import 'firebase/storage';
import { FirebaseDatabaseService } from "./firebase-database.service";

@Injectable()
export class FirebaseStorageService {

  constructor(
    private firebase: FirebaseApp,
    private databaseService: FirebaseDatabaseService,
  ) { }

  storageRef = this.firebase.storage().ref().child('SA44_ProfilesApp');

  uploadFile(userEmail: string, file: File, isAnEdit: boolean) {
    // Check if userEmail has a profile associated yet
    if (isAnEdit) {
      // If it does, get the reference of the existing image, and upload to that reference, overwriting it
      return this.databaseService.getProfileByEmail(userEmail)
        .then(profile => {
          console.log("uploadFile>getProfileByEmail..Profile:", profile);
          
          let imageStorageRef = this.firebase.storage().refFromURL(profile.photoUrl);
          return this._upload(imageStorageRef, file)
            .then(({filename, downloadUrl}) => {
              return this.firebase.storage().refFromURL(downloadUrl).getDownloadURL()
                .then(url => {
                  console.log("DL url: ", url);
                  return {filename, downloadUrl: url};
                })
              
            })
        })
        .catch(error => {
          console.log("uplaod file error: ", error);
          
          alert("Upload error: " + error.message)
        })
    } else {
      let imageStorageRef = this.storageRef.child(userEmail + "_photo_" + file.name);
      return this._upload(imageStorageRef, file);
    }
  }

  _upload(imageStorageRef: firebase.storage.Reference, file: File) {
    return imageStorageRef.put(file)
    .then(result => {
      console.log("uploadFile>Filename:", file.name);
      console.log("uploadFile>Return:", result);
      return {
        filename: file.name,
        downloadUrl: result.downloadURL,
      }
    })
  }

}
