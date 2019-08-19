import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinTable } from "typeorm";
import { Post } from "./Post";
import { Saying } from "./Saying";
import { User } from "./User";

@Entity()
export class Comment {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    commentDate: Date;

    @Column()
    content: string;

    @ManyToOne(type => User, {
        eager: true
    })
    user: User;

    @Column()
    isRoot: boolean;

    @ManyToOne(type => Comment, comment => comment.children)
    root: Comment;

    @OneToMany(type => Comment, comment => comment.root)
    children: Comment[];

    @ManyToOne(type => Comment)
    replyTo: Comment;

    @ManyToOne(type => Post)
    post: Post;

}