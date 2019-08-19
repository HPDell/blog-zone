import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Post } from "./Post";
import { Saying } from "./Saying";
import { User } from "./User";

@Entity()
export class Comment {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    content: string;

    @ManyToOne(type => User)
    user: User;

    @Column()
    isRoot: boolean;

    @ManyToOne(type => Comment, comment => comment.children)
    root: Comment;

    @OneToMany(type => Comment, comment => comment.root)
    children: Comment[];

    @ManyToOne(type => Comment)
    replyTo: Comment;

    @ManyToOne(type => Post, post => post.tags)
    post: Post[];

}