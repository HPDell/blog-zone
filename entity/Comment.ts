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
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    user: User;

    @Column()
    isRoot: boolean;

    @ManyToOne(type => Comment, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    root: Comment;

    @OneToMany(type => Comment, comment => comment.root, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    children: Comment[];

    @ManyToOne(type => Comment, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    replyTo: Comment;

    @ManyToOne(type => Post, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    post: Post;

}