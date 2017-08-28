export default class ProfileModel {
  constructor(
    public key = null,
    public likes: string[] = [],
    public visible: boolean = true,
    public email: string = "",
    public name: string = "",
    public phone: string = "",
    public birthdate: number = null,
    public photoUrl: string = "",
    public skills: string[] = [""],
    public comments: Comment[] = [],
  ) {  }

  getAge(): number {
    let dateOfBirth: Date = new Date(this.birthdate);
    let today: Date = new Date(Date.now());
    
    let currentYear = today.getFullYear();
    let birthYear = dateOfBirth.getFullYear();

    let currentMonth = today.getMonth();
    let birthMonth = dateOfBirth.getMonth();

    let currentDate = today.getDate();
    let birthDate = dateOfBirth.getDate();

    let age = currentYear - birthYear;
    if (birthMonth > currentMonth) {
      age -= 1;
    } else if (birthMonth == currentMonth) {
      // Check date
      if (birthDate > currentDate) {
        age -= 1;
      }
    }

    return age;
  }

  static inflateProfile(element): ProfileModel {
    let key = element.key;
    let user = element.val();
    
    user.key = key;
    // Setup likes
    let likes = [];
    for(let likeKey in user.likes) {            
      // console.log("inflate like", user.likes[likeKey]);
      likes.push(user.likes[likeKey]);
    }
    user.likes = likes;
    // Setup comments
    let comments = [];
    for(let comment in user.comments) {
      // console.log("inflate comment", comment);
                  
      comments.push(user.comments[comment]);
    }
    user.comments = comments;
    // Setup visible
    user.visible = true;
    
    // Hook up instance methods
    user.getAge = this.prototype.getAge;;
    return user;
  }
}

export class Comment {
  constructor(
    public email: string,
    public key: string,
    public comment: string,
    public timestamp: number,
  ) { }
}