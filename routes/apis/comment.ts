import * as express from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Request, Response } from "express";
import { getConnection } from 'typeorm';
import { Comment } from '../../entity/Comment';
import { Saying } from '../../entity/Saying';
import { Post } from '../../entity/Post';
import { User } from '../../entity/User';
import moment = require('moment');
let router = express.Router();

interface CommentGetQuery {
    type: "post" | "saying";
    id: string;
}

router.get("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        let query = req.query as CommentGetQuery;
        let comments;
        switch (query.type) {
            case "post":
                {
                    try {
                        let post = await connection.getRepository(Post).findOne(query.id);
                        try {
                            comments = await connection.getRepository(Comment).find({
                                where: {
                                    post: post,
                                    isRoot: true
                                },
                                relations: ["user"]
                            });
                        } catch (error) {
                            console.log(error);
                            return res.sendStatus(500);
                        }
                    } catch (error) {
                        console.log(error);
                        return res.sendStatus(500);
                    }
                    break;
                }
            case "saying":
                {
                    try {
                        // let saying = await connection.getRepository(Saying).findOne(query.id);
                        // try {
                        //     comments = await connection.getRepository(Comment).find({
                        //         where: {
                        //             saying: saying
                        //         }
                        //     });
                        // } catch (error) {
                        //     console.log(error);
                        //     return res.sendStatus(500);
                        // }
                    } catch (error) {
                        console.log(error);
                        return res.sendStatus(500);
                    }
                    break;
                }
            default:
                return res.sendStatus(500);
        }
        return res.json(comments);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.get("/:id", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const comment = await connection.getRepository(Comment).findOne(req.params.id, {
            relations: ["children"],
            order: {
                commentDate: "ASC"
            },
        });
        try {
            comment.children = await connection.getRepository(Comment).find({
                where: {
                    root: comment
                },
                order: {
                    commentDate: "ASC"
                }
            })
        } catch (error) {
            
        }
        return res.json(comment);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.get("/:id/reply/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const comment = await connection.getRepository(Comment).findOne({
            where: {
                id: req.params.id
            },
            order: {
                commentDate: "ASC"
            },
            relations: ["children"]
        });
        return res.json(comment);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.post("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    let commentInfo = new Comment();
    let userID = req.cookies["user"];
    try {
        let user = await connection.getRepository(User).findOne(userID);
        if (user) {
            commentInfo.user = user;
            if (req.query.post) {
                try {
                    const post = await connection.getRepository(Post).findOne(req.query.post);
                    commentInfo.post = post;
                } catch (error) {
                    console.log(error);
                    res.sendStatus(500);
                    return;
                }
                
            } else if (req.query.saying) {
                
            } else {
                return res.sendStatus(500);
            }
            try {
                let commentBody = req.body as Comment;
                commentInfo.content = commentBody.content;
                commentInfo.commentDate = moment().toDate();
                commentInfo.isRoot = commentBody.isRoot;
                if (!commentInfo.isRoot) {
                    try {
                        const root = await connection.getRepository(Comment).findOne(commentBody.root);
                        commentInfo.root = root;
                    } catch (error) {
                        
                    }
                    try {
                        const replyTo = await connection.getRepository(Comment).findOne(commentBody.replyTo);
                        commentInfo.replyTo = replyTo;
                    } catch (error) {
                        
                    }
                }
                try {
                    let comment = await connection.manager.save(commentInfo);
                    return res.json(comment);
                } catch (error) {
                    console.log(error);
                    return res.sendStatus(500);
                }
            } catch (error) {
                console.log(error);
                res.sendStatus(500);
                return;
            }
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

export default router;
