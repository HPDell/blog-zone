import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Picture } from "./Picture";

@Entity()
export class Post {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    postDate: Date;

    @OneToMany(type => Picture, picture => picture.post)
    pictures: Picture[];

    @ManyToOne(type => User, user => user.posts)
    user: User;

}