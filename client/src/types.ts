// for all the types that are used in the app
// types

export interface Post {
  identifier: string;
  title: string;
  body?: string; // we will check as there can also be a post without title
  slug: string;
  subName: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  sub?: Sub;

  // virtual fields
  url: string;
  voteScore?: number; // ? dictates that the value can be nullable
  commentCount?: number; // in the following fields
  userVote?: number; // i.e votescore, userscore and commentcount
}

export interface User {
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sub {
  createdAt: string;
  updatedAt: string;
  name: string;
  title: string;
  description: string;
  imageUrn: string;
  bannerUrn: string;
  username: string;
  posts: Post[];
  // virtuals
  imageUrl: string;
  bannerUrl: string;
  postCount?: number;
}

export interface Comment {
  createdAt: string;
  updatedAt: string;
  identifier: string;
  body: string;
  username: string;
  post?: Post;
  // virtuals
  userVote: number;
  voteScore: number;
}
