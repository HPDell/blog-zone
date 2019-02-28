import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany } from "typeorm";
import { Post } from "./Post";

@Entity()
export class Tag {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    // @ManyToMany(type => Post, post => post.tags)
    // posts: Post[];

}