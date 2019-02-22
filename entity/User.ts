import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Saying } from "./Saying";
import { Post } from "./Post";

@Entity()
export class User {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    description: string;

    @Column({nullable: true, unique: true})
    token: string;

    @Column({nullable: true})
    avatar: string;

    @Column({nullable: true})
    lastLoginTime: Date;

    @OneToMany(type => Saying, saying => saying.user)
    sayings: Saying[];

    @OneToMany(type => Post, post => post.user)
    posts: Post[];

}