import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from "typeorm";
import { Saying } from "./Saying";
import { Post } from "./Post";

@Entity()
export class Picture {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: true})
    path: string;

    @ManyToOne(type => Saying, saying => saying.pictures, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    saying: Saying;

    @ManyToOne(type => Post, post => post.pictures, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    post: Post;

    @OneToOne(type => Post, post => post.cover)
    coverPost: Post;

}