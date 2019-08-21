import * as express from 'express';
import { Request, Response } from "express";
import * as moment from "moment";
import * as fs from "fs-extra";
import { Saying } from '../../entity/Saying';
import { getConnection } from 'typeorm';
import { User } from '../../entity/User';
import { Picture } from '../../entity/Picture';
import { BlogZoneExpressRequest } from '../../app';
let router = express.Router();

router.get("/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const sayings = await connection.getRepository(Saying).find({
            order: {
                sayingDate: "DESC"
            }
        });
        return res.json(sayings.map(item => item.id));
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.get("/:id/", async function (req: Request, res: Response) {
    const connection = getConnection();
    try {
        const saying = await connection.getRepository(Saying).findOne(req.params.id, {
            relations: ["pictures"]
        });
        return res.json(saying);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.post("/", async function (req: BlogZoneExpressRequest, res: Response) {
    const connection = getConnection();
    try {
        let sayingInfo = new Saying();
        sayingInfo.user = req.user;
        sayingInfo.content = req.body.content;
        sayingInfo.sayingDate = moment().toDate();
        let saying = await connection.manager.save(sayingInfo);
        return res.json(saying);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return;
    }
});

router.delete("/:id/", async function (req: BlogZoneExpressRequest, res: Response) {
    const connection = getConnection();
    try {
        let saying = await connection.getRepository(Saying).findOne(req.params.id);
        if (saying.userId === req.user.id) {
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
                await connection.manager.remove(saying);
                res.sendStatus(200);
                return;
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
})

export default router;
