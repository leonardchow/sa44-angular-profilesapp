import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app'; // for typings
import { FirebaseApp } from 'angularfire2'; // for methods
import 'firebase/storage';

@Injectable()
export class FirebaseStorageService {

  constructor(private firebase: FirebaseApp) { }

  storageRef = this.firebase.storage().ref().child('SA44_ProfilesApp');

  uploadFile(userEmail: string, file: File) {
    let imageStorageRef = this.storageRef.child(userEmail + "_photo_" + file.name);
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
