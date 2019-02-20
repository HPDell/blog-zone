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
    nickname: string;

    @OneToMany(type => Saying, saying => saying.user)
    sayings: Saying[];

    @OneToMany(type => Post, post => post.user)
    posts: Post[];

}