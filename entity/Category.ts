import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Post } from "./Post";

@Entity()
export class Category {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(type => Post, post => post.tags, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    posts: Post[];

}