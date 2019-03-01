import * as express from 'express';
import { Request, Response } from "express";
import * as moment from "moment";
import * as fs from "fs-extra";
import { Post } from '../../entity/Post';
import { getConnection } from 'typeorm';
import { User } from '../../entity/User';
import { Picture } from '../../entity/Picture';
import { Category } from '../../entity/Category';
import { Tag } from '../../entity/Tag';
let router = express.Router();

router.get("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const posts = await connection.getRepository(Post).find({
            order: {
                postDate: "DESC"
            },
            relations: ["category", "tags", "cover"],
            select: ["id", "title", "postDate"]
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
        const post = await connection.getRepository(Post).findOne(req.params.id, {
            relations: ["category", "tags", "cover"]
        });
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
    try {
        let categoryInfo = req.body.category;
        if (categoryInfo && categoryInfo.id) {
            let category = await connection.getRepository(Category).findOne(categoryInfo.id);
            postInfo.category = category;
        } else {
            let category = await connection.getRepository(Category).findOne("default");
            postInfo.category = category;
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
    postInfo.tags = [];
    let tagsInfo: Tag[] = req.body.tags;
    for (const tagInfo of tagsInfo) {
        if (tagInfo.name) {
            try {
                let tagExist = await connection.getRepository(Tag).findOne({
                    name: tagInfo.name
                });
                if (tagExist) {
                    try {
                        let tag = await connection.manager.save(tagExist);
                        postInfo.tags.push(tag);
                    } catch (error) {
                        console.log("Save tag error:", error);
                    }
                } else {
                    let newTag = new Tag();
                    newTag.name = tagInfo.name;
                    try {
                        let tag = await connection.manager.save(newTag);
                        postInfo.tags.push(tag);
                    } catch (error) {
                        console.log("Save tag error:", error);
                    }
                }
            } catch (error) {
                console.log("Find tag error:", error);
            }
        }
    }
    if (req.body.cover) {
        try {
            let cover = await connection.getRepository(Picture).findOne(req.body.cover.id);
            if (cover) {
                postInfo.cover = cover;
            } else {
                console.log("Cover not found!");
            }
        } catch (error) {
            console.log("Find cover error:", error);
        }
    }
    // 查找博文中的图片链接
    postInfo.pictures = [];
    let pictureLinkArray = postInfo.content.match(/\!\[\]\(\/api\/picture\/[A-Za-z0-9\-]+\/\)/g);
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

router.put("/:id", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        let post = await connection.getRepository(Post).findOne(req.params.id, {
            relations: ["pictures", "cover"]
        });
        if (post) {
            post.title = req.body.title;
            post.postDate = moment().toDate();
            try {
                let categoryInfo = req.body.category;
                if (categoryInfo && categoryInfo.id) {
                    let category = await connection.getRepository(Category).findOne(categoryInfo.id);
                    post.category = category;
                } else {
                    let category = await connection.getRepository(Category).findOne("default");
                    post.category = category;
                }
            } catch (error) {
                console.log(error);
                res.sendStatus(500);
                return;
            }
            post.tags = [];
            let tagsInfo: Tag[] = req.body.tags;
            for (const tagInfo of tagsInfo) {
                if (tagInfo.name) {
                    try {
                        let tagExist = await connection.getRepository(Tag).findOne({
                            name: tagInfo.name
                        });
                        if (tagExist) {
                            try {
                                let tag = await connection.manager.save(tagExist);
                                post.tags.push(tag);
                            } catch (error) {
                                console.log("Save tag error:", error);
                            }
                        } else {
                            let newTag = new Tag();
                            newTag.name = tagInfo.name;
                            try {
                                let tag = await connection.manager.save(newTag);
                                post.tags.push(tag);
                            } catch (error) {
                                console.log("Save tag error:", error);
                            }
                        }
                    } catch (error) {
                        console.log("Find tag error:", error);
                    }
                }
            }
            if (req.body.cover && req.body.cover.id) {
                let coverInfo = req.body.cover;
                if (post.cover && post.cover.id) {
                    if (coverInfo.id !== post.cover.id) {
                        let oldCover = post.cover;
                        try {
                            let cover = await connection.getRepository(Picture).findOne(coverInfo.id);
                            if (cover) {
                                post.cover = cover;
                            } else {
                                console.log("Cover not found!");
                            }
                        } catch (error) {
                            console.log("Find cover error:", error);
                        }
                        try {
                            await fs.remove(oldCover.path);
                            await connection.manager.remove(oldCover);
                        } catch (error) {
                            console.log("Remove old cover error:", error);
                        }
                    }
                } else {
                    try {
                        let cover = await connection.getRepository(Picture).findOne(coverInfo.id);
                        if (cover) {
                            post.cover = cover;
                        } else {
                            console.log("Cover not found!");
                        }
                    } catch (error) {
                        console.log("Find cover error:", error);
                    }
                }
            }
            // 查找博文中的图片链接
            let content = req.body.content;
            try {
                let pictureList = await connection.getRepository(Picture).find({
                    post: post
                });
                let pictureLinkArray = content.match(/\!\[\]\(\/api\/picture\/[A-Za-z0-9\-]+\/\)/g);
                if (pictureLinkArray) {
                    for (const link of pictureLinkArray) {
                        let pictureID = link.match(/([A-Za-z0-9]+\-){4}([A-Za-z0-9]+)/)[0];
                        if (pictureID) {
                            let index = pictureList.findIndex((i => i.id === pictureID));
                            if (index > -1) {
                                pictureList.splice(index, 1);
                            } else {
                                try {
                                    let picture = await connection.getRepository(Picture).findOne(pictureID);
                                    post.pictures.push(picture);
                                } catch (error) {
                                    console.log(`Query picture ${pictureID} error:`, error);
                                }
                            }
                        }
                    }
                    for (const pic of pictureList) {
                        try {
                            await fs.remove(pic.path);
                            await connection.manager.remove(pic);
                        } catch (error) {
                            console.log(`Remove picture ${pic.id} error:`, error);
                        }
                    }
                }
                post.content = content;
            } catch (error) {
                console.log(`Find picture list of post ${post.id} error:`, error);
            }
            try {
                post = await connection.manager.save(post);
                res.json(post);
            } catch (error) {
                console.log(error);
                res.sendStatus(500);
                return;
            }
        }
    } catch (error) {
        
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
