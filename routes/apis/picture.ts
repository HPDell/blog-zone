import * as express from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Request, Response } from "express";
import { getConnection } from 'typeorm';
import { Picture } from '../../entity/Picture';
import { Saying } from '../../entity/Saying';
let router = express.Router();

import * as multer from "multer";
import * as uuid from "uuid/v4";
import * as mime from "mime";
let storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: any) => void) {
        let dest = path.resolve(path.join(__dirname, "../../public", file.fieldname));
        fs.ensureDir(dest, (err) => {
            if (err) {
                callback(null, false);
            } else {
                callback(null, dest);
            }
        })
    },
    filename: function (req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) {
        let filename = [uuid(), mime.getExtension(file.mimetype)].join(".");
        callback(null, filename);
    }
})
let upload = multer({
    storage: storage
})

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
        res.sendFile(picture.path);
    } catch (error) {
        res.status(500);
    }
});

router.post("/", upload.single('photos'), async function (req: Request, res: Response) {
    const connection = getConnection();
    let pictureInfo = new Picture();
    pictureInfo.path = path.join(req.file.destination, req.file.filename);
    if (req.query.saying) {
        try {
            const saying = await connection.getRepository(Saying).findOne(req.query.saying);
            pictureInfo.saying = saying;
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
            return;
        }
    }
    try {
        let picture = await connection.manager.save(pictureInfo);
        res.json(picture);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
})

export default router;
