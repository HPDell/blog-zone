import * as express from 'express';
import { Request, Response } from "express";
import { Category } from '../../entity/Category';
import { getConnection } from 'typeorm';
import { Post } from '../../entity/Post';
let router = express.Router();

router.get("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    let categoriesInfo = [];
    try {
        const categories = await connection.getRepository(Category).find();
        for (const category of categories) {
            try {
                const posts = await connection.getRepository(Post).find({
                    where: {
                        category: category
                    },
                    select: ["id"]
                })
                categoriesInfo.push({
                    ...category,
                    postNums: posts.length
                });
            } catch (error) {
                console.log("Find tag post num error", error);
                categoriesInfo.push({
                    ...category
                })
            }
        }
        res.json(categoriesInfo);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.get("/:id/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const category = await connection.getRepository(Category).findOne(req.params.id);
        res.json(category);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.post("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        let categoryInfo = new Category();
        categoryInfo.name = req.body.name;
        let category = await connection.manager.save(categoryInfo);
        res.json(category);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.put("/:id/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        let categoryInfo = await connection.getRepository(Category).findOne(req.params.id);
        try {
            categoryInfo.name = req.body.name;
            let category = await connection.manager.save(categoryInfo);
            res.json(category);
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
        let category = await connection.getRepository(Category).findOne(req.params.id);
        try {
            let postList = await connection.getRepository(Post).find({
                category: category
            });
            for (const post of postList) {
                try {
                    let defaultCategory = await connection.getRepository(Category).findOne("default");
                    post.category = defaultCategory;
                    try {
                        await connection.manager.save(post);
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
            await connection.manager.remove(category);
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
