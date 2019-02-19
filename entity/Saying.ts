import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
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

    @ManyToOne(type => User, user => user.sayings)
    user: User;

    @OneToMany(type => Picture, picture => picture.saying)
    pictures: Picture[];

}