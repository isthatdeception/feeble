import { IsEmail, Length } from "class-validator";
import {
  Entity as TOEntity,
  Column,
  Index,
  BeforeInsert,
  OneToMany,
} from "typeorm";

// for extra layer of security
import bcrypt from "bcrypt";

// for hiding some classes from the response
import { Exclude } from "class-transformer";

// relative import
import Entity from "./Entity";
import Post from "./Post";
import Vote from "./Vote";

@TOEntity("users")
export default class User extends Entity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  // index introduces performance when querying to the database
  @Index()
  @IsEmail(undefined, { message: "Must be a vaild email address" })
  @Length(1, 255, { message: "Email is empty" })
  @Column({ unique: true })
  email: string;

  // index introduces performance when querying to the database
  @Index()
  @Length(3, 255, { message: "Must be atleast 3 characters long" })
  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  @Length(6, 255, { message: "Must be atleast 6 characters long" })
  password: string;

  // one to many relation by typeORM
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
