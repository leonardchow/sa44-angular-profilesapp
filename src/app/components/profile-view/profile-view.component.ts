import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { FirebaseDatabaseService } from "../../providers/firebase-database.service";
import ProfileModel, { Comment } from "../../models/userModel";
import { FirebaseAuthService } from "../../providers/firebase-auth.service";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css']
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  TAKE: number = 10;
  keepFrom: number;

  newComment: string;

  userEmail: string;
  profileKey: string;
  profile: ProfileModel;

  likesSub: Subscription;
  commentsSub: Subscription;
  authSub: Subscription;

  firstLoad: boolean;

  @ViewChild('commentScrollArea')
  scrollArea: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private databaseService: FirebaseDatabaseService,
    public authService: FirebaseAuthService,
  ) { }
  
  ngOnInit() {
    this.firstLoad = true;
    // this.scrollArea.nativeElement.scrollTop = this.scrollArea.nativeElement.scrollHeight;
    
    if (! this.route.snapshot.paramMap.has('key')) {
      return; // Guard if there's no key
    }

    this.profileKey = this.route.snapshot.paramMap.get('key');

    this.databaseService.getProfile(this.profileKey)
      .then(profile => {
        console.log("dbService::getProfile", profile);
        profile.comments = profile.comments.slice(Math.max(profile.comments.length - this.TAKE, 0));
        this.profile = profile;
      })

      // Likes sub
    this.likesSub = this.databaseService.likesStream
    .subscribe(
      nextVal => {
        // console.log(nextVal);
        // update likes

        if (this.profileKey == nextVal.profileKey) {
          this.profile.likes = nextVal.likesData;
        }
      },
      errorVal => {

      }
    )

    this.authSub = this.authService.user.subscribe(user => {
      if (user == null) {
        this.userEmail = null;
      } else {
        this.userEmail = user.email;
      }
    })

    this.commentsSub = this.databaseService.commentsStream.subscribe(commentsUpdate => {
      if (commentsUpdate.profileKey != this.profileKey) {
        return; // Guard: Not this profile, ignore
      }

      let comments = commentsUpdate.commentsData;
      if (this.firstLoad) {
        this.keepFrom = Math.max(comments.length - this.TAKE, 0);
        this.firstLoad = ! this.firstLoad;
      }
      commentsUpdate.commentsData = comments.slice(this.keepFrom);
      this.profile.comments = commentsUpdate.commentsData;
    })

  }

  ngOnDestroy(): void {
    this.likesSub.unsubscribe();
    this.commentsSub.unsubscribe();
    this.authSub.unsubscribe();
  }

  submitComment(event) {
    event.preventDefault();
    let comment = this.newComment;
    if (comment.trim().length === 0) {
      this.newComment = "";
      return;
    }
    this.databaseService.makeNewComment(this.profileKey, this.userEmail, comment);

    this.newComment = "";
  }

  onLike(event, idx) {
    
    let profile = this.profile;
    
    let index = profile.likes.indexOf(this.userEmail);
    console.log("index of likes: " + index);
    
    if (index >= 0) {
      profile.likes.splice(index, 1);
      // this.databaseService.removeLikeFromProfileByUser(profile.key, this.userEmail);
    } else {
      this.profile.likes.push(this.userEmail);
      // this.databaseService.addLikeToProfileByUser(profile.key, this.userEmail);
    }
    
    this.databaseService.toggleLikeForProfileByUser(profile.key, this.userEmail);
    
  }

}
