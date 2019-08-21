import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { Picture } from "./Picture";

@Entity()
export class Saying {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    content: string;

    @Column()
    sayingDate: Date;

    @ManyToOne(type => User, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    user: User;

    @Column({nullable: true})
    userId: string;

    @OneToMany(type => Picture, picture => picture.saying, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    })
    pictures: Picture[];

}