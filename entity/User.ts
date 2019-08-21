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

    @Column({default: false})
    canEdit: boolean;

    @Column({default: true})
    canComment: boolean;

    @OneToMany(type => Saying, saying => saying.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    sayings: Saying[];

    @OneToMany(type => Post, post => post.user, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    posts: Post[];

}