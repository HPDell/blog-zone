import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Picture } from "./Picture";
import { Category } from "./Category";
import { Tag } from "./Tag";
import { Comment } from "./Comment";

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

    @OneToOne(type => Picture, picture => picture.coverPost)
    @JoinColumn()
    cover: Picture;

    @OneToMany(type => Picture, picture => picture.post, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    pictures: Picture[];

    @ManyToOne(type => User, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    user: User;

    @Column({nullable: true})
    userId: string;

    @ManyToOne(type => Category, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    category: Category;

    @ManyToMany(type => Tag)
    @JoinTable()
    tags: Tag[];

    @OneToMany(type => Comment, comment => comment.post, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    comments: Comment[];

}