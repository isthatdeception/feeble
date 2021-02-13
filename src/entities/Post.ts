import {
  Entity as TOEntity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  OneToMany,
} from "typeorm";

import { Exclude, Expose } from "class-transformer";

// relative import
import Entity from "./Entity";
import User from "./User";
import { makeId, slugify } from "../utils/helper";
import Sub from "./Sub";
import Comment from "./Comment";
import Vote from "./Vote";

@TOEntity("posts")
export default class Post extends Entity {
  constructor(post: Partial<Post>) {
    super();
    Object.assign(this, post);
  }

  @Index()
  @Column()
  identifier: string; // 7 Character POST ID

  @Column()
  title: string;

  /**
   * A slug is part of your page URL.
   * Each page within your website has a URL and within each URL is a unique slug.
   */

  @Index()
  @Column()
  slug: string;

  @Column({ nullable: true, type: "text" })
  body: string;

  @Column()
  subName: string; // name of the sub this post belongs to

  @Column()
  username: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @ManyToOne(() => Sub, (sub) => sub.posts)
  @JoinColumn({ name: "subName", referencedColumnName: "name" })
  sub: Sub;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Exclude()
  @OneToMany(() => Vote, (vote) => vote.post)
  votes: Vote[];

  // virtual
  @Expose() get url(): string {
    return `/f/${this.subName}/${this.identifier}/${this.slug}`;
  }

  // another virtual one
  @Expose() get commentCount(): number {
    return this.comments?.length; // ? is for empty [ this value is nullable ]
  }

  @Expose() get voteScore(): number {
    return this.votes?.reduce((prev, curr) => prev + (curr.value || 0), 0);
  }

  // updating the post of the user
  protected userVote: number;
  setUserVote(user: User) {
    const index = this.votes?.findIndex((v) => v.username === user.username);
    this.userVote = index > -1 ? this.votes[index].value : 0;
  }

  @BeforeInsert()
  makeIdAndSlug() {
    this.identifier = makeId(7);
    this.slug = slugify(this.title);
  }
}
