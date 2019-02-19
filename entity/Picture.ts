import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Saying } from "./Saying";

@Entity()
export class Picture {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: true})
    path: string;

    @ManyToOne(type => Saying, saying => saying.pictures)
    saying: Saying;

}