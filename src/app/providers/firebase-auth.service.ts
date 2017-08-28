import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';

import * as firebase from 'firebase/app';

@Injectable()
export class FirebaseAuthService {

  public user: Observable<firebase.User>

  constructor(public afAuth: AngularFireAuth) {
    this.user = afAuth.authState;
  }

  loginWithGoogle(): firebase.Promise<any> {
    return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  loginWithFacebook(): firebase.Promise<any> {
    return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
  }

  loginWithEmail(email: string, password: string): firebase.Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  signUpWithEmail(email: string, password: string): firebase.Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  logout() {
    return this.afAuth.auth.signOut();
  }

}
