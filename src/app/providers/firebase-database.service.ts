import { Injectable } from '@angular/core';
import { AngularFireDatabase } from "angularfire2/database";
import ProfileModel, { Comment } from "../models/userModel";
import { LikesUpdate, CommentsUpdate } from "../models/likesUpdateModel";
import * as firebase from 'firebase';

import { Observable } from 'rxjs/Observable';


@Injectable()
export class FirebaseDatabaseService {
  
  databaseRef: firebase.database.Reference;
  likesStream: Observable<LikesUpdate>;
  commentsStream: Observable<CommentsUpdate>;

  constructor(
    private database: AngularFireDatabase
  ) { 

    this.databaseRef = this.database.database.ref().child('SA44_ProfilesApp').child('profiles');

    this.likesStream = new Observable(observer => {
      // Attach listeners to all likes things
      this.databaseRef.once('value')
        .then(snaps => {
          // console.log("snap.val()", snap.val());
          
          snaps.forEach(snap => {

            let profileRef: firebase.database.Reference =
              snap.ref;
            profileRef.child('likes')
              .on('value', data => {
                // console.log('likes changed', data.val(), snap.key);
                let likesData = [];

                for (let datum in data.val()) {
                  let likeEmail = data.val()[datum];
                  likesData.push(likeEmail);
                }

                let likesUpdate: LikesUpdate = {
                  profileKey: snap.key,
                  likesData,
                }
                observer.next(likesUpdate);
              })
          })
        })
      })

    this.commentsStream = new Observable(observer => {
      this.databaseRef.once('value')
      .then(snaps => {
        snaps.forEach(snap => {

          let profileRef: firebase.database.Reference =
            snap.ref;
          profileRef.child('comments')
            .on('value', data => {
              // console.log('comments changed', data.val(), snap.key);
              let commentsData: Comment[] = [];
              
              for (let datum in data.val()) {
                let rawComment = data.val()[datum];
                // console.log("comment", rawComment);
                let timestamp = 0;
                if (rawComment.timestamp) {
                  timestamp = rawComment.timestamp;
                }
                let comment: Comment = {
                  key: datum,
                  email: rawComment.email,
                  comment: rawComment.comment,
                  timestamp,
                }
                
                commentsData.push(comment);
              }

              let commentsUpdate = {
                profileKey: snap.key,
                commentsData,
              }
              observer.next(commentsUpdate);
            })
        })
      })
    })

      // Attach listener to FireBase DB
    //   this.databaseRef.on('child_changed', (data) => {
    //     console.log('profiles value changed!');
    //     if (data)
    //     observer.next()
    //   })
    // })
  }
  
  saveNewProfile(user: ProfileModel, isAnEdit: boolean) {
    if (isAnEdit) {
      let preparedUser = ProfileModel.prepareForUpdate(user);
      return this.databaseRef.child(user.key).update(preparedUser);
    } else {
      return this.databaseRef.push(user);
    }
  }

  getAllProfiles() {
    return this.databaseRef.once('value')
      .then(values => {
        let users: ProfileModel[] = [];
        values.forEach(element => {
          let user = ProfileModel.inflateProfile(element);
          users.push(user);
        });
        return users;
      })
  }

  doesUserHaveProfile(userEmail: string): firebase.Promise<{ hasProfile: boolean, profileKey: string }> {
    return this.databaseRef.once('value')
      .then(values => {
        let hasProfile = false;
        console.log(values.val());
        let profileKey = null;

        for (let idxKey in values.val()) {

          if (values.val()[idxKey].email == userEmail) {
            // console.log("doesUserHaveProfile", values.val()[idxKey].email);
            // console.log("doesUserHaveProfile userEmail", userEmail);
            profileKey = idxKey;
            hasProfile = true;
            break;
          }
        }
        return {
          hasProfile,
          profileKey,
        }
      })
  }

  getProfile(key: string): firebase.Promise<ProfileModel> {
    return this.databaseRef.child(key).once('value')
      .then(element => {
        return ProfileModel.inflateProfile(element);
      })
  }
  
  getProfileByEmail(email: string): firebase.Promise<ProfileModel> {
    return this.databaseRef.orderByChild('email').equalTo(email).limitToFirst(1).once('value')
      .then(element => {
        // console.log("getProfileByEmail: elKey", element.key)
        console.log("getProfileByEmail: elVal", element.val())
        
        let profileKey = null;
        for(let idxKey in element.val()) {
          profileKey = idxKey
          // Just get one
          break;
        }

        return this.getProfile(profileKey);
      })
  }

  makeNewComment(profileKey: string, userEmail: string, comment: string) {
    let payload = {
      email: userEmail,
      comment,
      timestamp: Date.now()
    }
    this.databaseRef.child(profileKey).child('comments')
      .push(payload);
  }
  
  toggleLikeForProfileByUser(profileKey: string, userEmail: string) {
    // figure out of likes array includes the current user
    // Stored as '-$key' : '$userEmail'
    // HAS USER: don't do anything
    // DOES NOT HAVE USER: push userEmail
    
    this.databaseRef.child(profileKey).child('likes').once('value')
      .then(values => {
        let key: string = null;
        values.forEach(element => {
          if (element.val() == userEmail) {
            key = element.key;
          }
        })
        console.log(key);
        if (key) {
          // User has liked
          this.databaseRef.child(profileKey).child('likes').child(key)
            .remove(error => {
              if (error) {
                console.log("Error removing like for key: " + key);
              }
            })
        } else {
          // User has not liked
          this.databaseRef.child(profileKey).child('likes').push(userEmail);
        }
      })
  }
}
