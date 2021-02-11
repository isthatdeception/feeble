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

  // virtual fields
  url: string;
}
