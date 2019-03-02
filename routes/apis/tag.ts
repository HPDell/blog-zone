import * as express from 'express';
import { Request, Response } from "express";
import { Tag } from '../../entity/Tag';
import { getConnection } from 'typeorm';
import { Post } from '../../entity/Post';
let router = express.Router();

router.get("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    let tagInfo = [];
    try {
        const tags = await connection.getRepository(Tag).find();
        for (const tag of tags) {
            try {
                const posts = await connection.getRepository("post_tags_tag")
                    .createQueryBuilder("post_tags")
                    .select("postId")
                    .where(`post_tags.tagId = '${tag.id}'`)
                    .getCount()
                tagInfo.push({
                    ...tag,
                    postNums: posts
                });
            } catch (error) {
                console.log("Find tag post num error", error);
                tagInfo.push({
                    ...tag
                })
            }
        }
        return res.json(tagInfo);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.get("/:id/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const tag = await connection.getRepository(Tag).findOne(req.params.id);
        return res.json(tag);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.post("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        let tagInfo = new Tag();
        tagInfo.name = req.body.name;
        let tag = await connection.manager.save(tagInfo);
        return res.json(tag);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.put("/:id/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        let tagInfo = await connection.getRepository(Tag).findOne(req.params.id);
        try {
            tagInfo.name = req.body.name;
            let tag = await connection.manager.save(tagInfo);
            return res.json(tag);
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
});

router.delete("/:id/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        let tag = await connection.getRepository(Tag).findOne(req.params.id);
        try {
            // let postList = await connection.getRepository(Post).find({
            //     tags: [tag]
            // });
            // for (const post of postList) {
            //     post.tags = post.tags;
            //     try {
            //         await connection.manager.save(post);
            //     } catch (error) {
            //         console.log(error);
            //         res.sendStatus(500);
            //         return;
            //     }
            // }
            await connection.manager.remove(tag);
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
