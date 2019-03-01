import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from "typeorm";
import { Saying } from "./Saying";
import { Post } from "./Post";

@Entity()
export class Picture {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: true})
    path: string;

    @ManyToOne(type => Saying, saying => saying.pictures)
    saying: Saying;

    @ManyToOne(type => Post, post => post.pictures)
    post: Post;

    @OneToOne(type => Post, post => post.cover)
    coverPost: Post;

}