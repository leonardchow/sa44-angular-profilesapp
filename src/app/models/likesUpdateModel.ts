import { Comment } from './userModel'

export interface LikesUpdate {
  profileKey: string,
  likesData: string[],
}

export interface CommentsUpdate {
  profileKey: string,
  commentsData: Comment[],
}