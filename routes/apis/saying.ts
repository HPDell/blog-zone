import * as express from 'express';
import { Request, Response } from "express";
import * as moment from "moment";
import * as fs from "fs-extra";
import { Saying } from '../../entity/Saying';
import { getConnection } from 'typeorm';
import { User } from '../../entity/User';
import { Picture } from '../../entity/Picture';
let router = express.Router();

router.get("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const sayings = await connection.getRepository(Saying).find({
            order: {
                sayingDate: "DESC"
            }
        });
        res.json(sayings.map(item => item.id));
    } catch (error) {
        res.sendStatus(500);
    }
});

router.get("/:id/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const saying = await connection.getRepository(Saying).findOne(req.params.id, {
            relations: ["pictures"]
        });
        res.json(saying);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.post("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    let userID = req.cookies["user"];
    try {
        let user = await connection.getRepository(User).findOne(userID);
        try {
            let sayingInfo = new Saying();
            sayingInfo.user = user;
            sayingInfo.content = req.body.content;
            sayingInfo.sayingDate = moment().toDate();
            let saying = await connection.manager.save(sayingInfo);
            res.json(saying);
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
        let saying = await connection.getRepository(Saying).findOne(req.params.id);
        try {
            let pictureList = await connection.getRepository(Picture).find({
                saying: saying
            });
            for (const pic of pictureList) {
                try {
                    await fs.remove(pic.path);
                    try {
                        await connection.manager.remove(pic);
                    } catch (error) {
                        res.sendStatus(500);
                        return;
                    }
                } catch (error) {
                    res.sendStatus(500);
                    return;
                }
            }
            await connection.manager.remove(saying);
            res.sendStatus(200);
            return;
        } catch (error) {
            res.sendStatus(500);
            return;
        }
    } catch (error) {
        res.sendStatus(500);
        return;
    }
})

export default router;
