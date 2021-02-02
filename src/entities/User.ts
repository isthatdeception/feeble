import { IsEmail, Length } from "class-validator";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from "typeorm";

// for extra layer of security
import bcrypt from "bcrypt";

// for hiding some classes from the response
import { classToPlain, Exclude } from "class-transformer";

@Entity("users")
export class User extends BaseEntity {
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  // index introduces performance when querying to the database
  @Index()
  @IsEmail()
  @Column({ unique: true })
  email: string;

  // index introduces performance when querying to the database
  @Index()
  @Length(3, 255, { message: "Username must be atleast 3 characters at long" })
  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  @Length(6, 255)
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }

  // to JSON
  toJSON() {
    return classToPlain(this);
  }
}
