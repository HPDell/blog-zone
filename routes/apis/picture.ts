import * as express from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Request, Response } from "express";
import { getConnection } from 'typeorm';
import { Picture } from '../../entity/Picture';
let router = express.Router();

router.get("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const pictures = await connection.getRepository(Picture).find();
        res.json(pictures);
    } catch (error) {
        res.status(500);
    }
});

router.get("/:id", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const picture = await connection.getRepository(Picture).findOne(req.params.id);
        res.json(picture);
    } catch (error) {
        res.status(500);
    }
});

router.post("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    let pictureInfo = new Picture();
    try {
        let picture = await connection.manager.save(pictureInfo);
        let id = picture.id;
    } catch (error) {
        
    }
})

export default router;
