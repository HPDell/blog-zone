import * as express from 'express';
import { Request, Response } from "express";
import * as moment from "moment";
import { Post } from '../../entity/Post';
import { getConnection } from 'typeorm';
import { User } from '../../entity/User';
let router = express.Router();

router.get("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const posts = await connection.getRepository(Post).find({
            order: {
                postDate: "DESC"
            }
        });
        res.json(posts);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.get("/:id/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const post = await connection.getRepository(Post).findOne(req.params.id);
        res.json(post);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.post("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        try {
            let postInfo = new Post();
            postInfo.title = req.body.title;
            postInfo.content = req.body.content;
            postInfo.postDate = moment().toDate();
            let post = await connection.manager.save(postInfo);
            res.json(post);
        } catch (error) {
            res.sendStatus(500);
        }
    } catch (error) {
        res.sendStatus(500);
    }
});

router.delete("/:id/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        let post = await connection.getRepository(Post).findOne(req.params.id);
        try {
            await connection.manager.remove(post);
            res.sendStatus(200);
        } catch (error) {
            res.sendStatus(500);
        }
    } catch (error) {
        res.sendStatus(500);        
    }
})

export default router;
