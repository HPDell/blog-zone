import * as express from 'express';
import { Request, Response } from "express";
import * as moment from "moment";
import * as fs from "fs-extra";
import { Post } from '../../entity/Post';
import { getConnection } from 'typeorm';
import { User } from '../../entity/User';
import { Picture } from '../../entity/Picture';
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
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.get("/:id/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const post = await connection.getRepository(Post).findOne(req.params.id);
        res.json(post);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.post("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    let postInfo = new Post();
    postInfo.title = req.body.title;
    postInfo.content = req.body.content;
    postInfo.postDate = moment().toDate();
    // 查找博文中的图片链接
    postInfo.pictures = [];
    let pictureLinkArray = postInfo.content.match(/\!\[\]\(\/api\/picture\/[A-Za-z0-9\-]+\/\)/);
    if (pictureLinkArray) {
        for (const link of pictureLinkArray) {
            let pictureID = link.match(/([A-Za-z0-9]+\-){4}([A-Za-z0-9]+)/)[0];
            if (pictureID) {
                try {
                    let picture = await connection.getRepository(Picture).findOne(pictureID);
                    postInfo.pictures.push(picture);
                } catch (error) {
                    console.log(`Query picture ${pictureID} error:`, error);
                }
            }
        }
    }
    try {
        let post = await connection.manager.save(postInfo);
        res.json(post);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.delete("/:id/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        let post = await connection.getRepository(Post).findOne(req.params.id);
        try {
            let pictureList = await connection.getRepository(Picture).find({
                post: post
            });
            for (const pic of pictureList) {
                try {
                    await fs.remove(pic.path);
                    try {
                        await connection.manager.remove(pic);
                    } catch (error) {
                        console.log(error);
                        res.sendStatus(500);
                        return;
                    }
                } catch (error) {
                    console.log(error);
                    res.sendStatus(500);
                    return;
                }
            }
            await connection.manager.remove(post);
            res.sendStatus(200);
            return;
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
})

export default router;
