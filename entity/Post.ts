import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { User } from "./User";
import { Picture } from "./Picture";
import { Category } from "./Category";
import { Tag } from "./Tag";

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

    @ManyToOne(type => Category, category => category.posts)
    category: Category;

    @ManyToMany(type => Tag)
    @JoinTable()
    tags: Tag[];

}