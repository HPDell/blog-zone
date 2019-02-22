import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
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

}